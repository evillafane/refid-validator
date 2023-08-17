const axios = require('axios');
const fs = require('fs');

async function fetchAllSKUs(accountName, appKey, appToken) {
    const apiUrl = `https://${accountName}.vtexcommercestable.com.br/api/catalog_system/pvt/sku/stockkeepingunitids`;
    const headers = getHeaders(appKey, appToken);

    const allSKUs = [];
    let currentPage = 1;
    const pageSize = 500;

    while (true) {
        const params = {
            page: currentPage,
            pageSize,
        };

        const response = await axios.get(apiUrl, { headers, params });
        const skus = response.data;

        if (skus.length === 0) {
            break;
        }

        console.log(`Página ${currentPage}: ${skus.length} SKUs`);

        allSKUs.push(...skus);
        currentPage += 1;
    }

    return allSKUs;
}

async function fetchSKUData(apiUrl, headers, skuId, maxRetries) {
    let retries = 0;

    while (retries < maxRetries) {
        try {
            const response = await axios.get(apiUrl, { headers });

            if (response.status === 200) {
                return response;
            }

            console.log(`Retrying SKU ${skuId} due to status ${response.status}`);
        } catch (error) {
            console.error(`Error fetching SKU ${skuId}: ${error.message}`);
        }

        retries += 1;
    }

    throw new Error(`Failed to fetch SKU ${skuId} after ${maxRetries} retries`);
}

async function fetchInvalidProductIds(accountName, appKey, appToken, maxRetries = 3) {
    const skuList = await fetchAllSKUs(accountName, appKey, appToken);

    const invalidProductIds = new Set();
    const batchSize = 1000;

    for (let i = 0; i < skuList.length; i += batchSize) {
        const batch = skuList.slice(i, i + batchSize);

        const batchRequests = batch.map(async (skuId) => {
            const apiUrl = `https://${accountName}.vtexcommercestable.com.br/api/catalog_system/pvt/sku/stockkeepingunitbyid/${skuId}`;
            const headers = getHeaders(appKey, appToken);

            const response = await fetchSKUData(apiUrl, headers, skuId, maxRetries);

            if (response && response.status < 500) {
                const currentProduct = response.data;

                if (!currentProduct.ProductRefId) {
                    console.log(`SKU ${skuId} has no ProductRefId`);
                    invalidProductIds.add(currentProduct.ProductId);
                } else {
                    console.log(`SKU ${skuId} has ProductRefId ${currentProduct.ProductRefId}`);
                }
            }
        });

        await Promise.all(batchRequests);

        console.log(`Processed ${i + batch.length} SKUs`);
    }

    return Array.from(invalidProductIds);
}

function getHeaders(appKey, appToken) {
    return {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-vtex-api-appKey': appKey,
        'x-vtex-api-appToken': appToken,
    };
}

function validateArguments() {
    const accountName = process.argv[2];
    const appKey = process.argv[3];
    const appToken = process.argv[4];

    if (!accountName) {
        console.error('Por favor, proporciona el nombre de la cuenta como argumento al ejecutar el script.');
        process.exit(1);
    } 

    if (!appKey || !appToken) {
        console.error('Por favor, proporciona x-vtex-api-appKey y x-vtex-api-appToken como argumentos al ejecutar el script.');
        process.exit(1);
    }

    return { accountName, appKey, appToken };
}

async function main() {
    const { accountName, appKey, appToken } = validateArguments();
    
    const invalidProductIds = await fetchInvalidProductIds(accountName, appKey, appToken);
    
    console.log('Invalid product IDs:');

    // write to file
    
    console.log(invalidProductIds);
    fs.writeFileSync('invalid-product-ids.txt', invalidProductIds.join('\n'));
}

main();
