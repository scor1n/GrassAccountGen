# GrassAccountGen

This project generates multiple Grass accounts using proxies and solves captchas using CapSolver. This was a simple script and will likely not be updated. Don't expect this to have well written code, it was done in a rush. 

## Prerequisites

- Node.js installed on your machine
- `ffi-napi` package
- `uuid` package

## Installation

1. Clone the repository or download the source code.
2. Navigate to the project directory.
3. Install the required npm packages:
    ```sh
    npm install ffi-napi uuid
    ```

## Configuration

1. Open the [`index.js`](index.js)
2. Fill in the following information:
    ```javascript
    const catchallDomain = 'your-catchall-domain.com';
    const capSolverApiKey = 'YOUR_CAPSOLVER_API_KEY'; // https://dashboard.capsolver.com/passport/register?inviteCode=6XKugRuEv4Hb
    const referralCode = 'YOUR_REFERRAL_CODE';
    const amount = 10; // Amount of accounts to generate
    ```

## Running the Script

1. Ensure you have a list of proxies in the `./input/proxies.txt` file, each proxy on a new line in the format [`ip:port:username:password`](input/proxies.txt).
2. Run the script:
    ```sh
    node index.js
    ```

## Output

- The generated account details will be saved in the `./output/logins.txt` file in the format [`username,password,proxy`](output/).
