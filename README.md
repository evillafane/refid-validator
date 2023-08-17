# SKU Validation Script

This script is designed to fetch and validate SKUs (Stock Keeping Units) from a VTEX Commerce store. It checks for invalid product IDs and writes the results to a file.

## Prerequisites

Before using this script, make sure you have the following:

- Node.js installed on your machine
- A VTEX Commerce account with access to the API
- API credentials: `appKey` and `appToken` for authentication

## Installation

1. Clone this repository to your local machine or download the script directly.
2. Open a terminal and navigate to the script's directory.
3. Install the required dependencies by running:

```bash
npm install
```

## Usage

To use the script, follow these steps:

1. Open a terminal and navigate to the script's directory.
2. Run the script with the following command, providing the required arguments:

```bash
node script.js <accountName> <appKey> <appToken>
```

Replace `<accountName>`, `<appKey>`, and `<appToken>` with your VTEX Commerce account name, API app key, and API app token respectively.

Example:

```bash
node script.js myaccount ABC123XYZ456 789PQR567
```

The script will then perform the following steps:

1. Fetch all SKUs from the VTEX store.
2. Validate each SKU to ensure it has a valid `ProductRefId`.
3. Write the IDs of products with invalid SKUs to a file named `invalid-product-ids.txt`.

## Output

After running the script, you will see the following output in the terminal:

- Progress updates indicating the processing of SKUs.
- A list of invalid product IDs.

Additionally, the script will create a file named `invalid-product-ids.txt` in the same directory, containing the list of invalid product IDs separated by line breaks.

## Notes

- The script uses Axios to make API requests and the `fs` module to write to files.
- If you encounter any errors or issues, please review the script and ensure that you have provided the correct API credentials.
