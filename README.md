# eslint-plugin-sunset

ESLint plugin that escalates warnings to errors based on a "sunset" (removal) date specified in the message.

## Features

-   If a warning message contains a removal date in the format `will be removed in YYYY-MM-DD`:
    -   If the date is **today or in the past**, the warning is escalated to an error.
    -   If the date is **in the future**, the warning remains a warning.
-   All other warnings and errors are left unchanged.

## Usage

1. **Installation**

    Install the plugin in your project:

    ```sh
    npm install --save-dev eslint-plugin-sunset
    ```

2. **Configuration**

    In your `.eslintrc.js` file:

    ```js
    module.exports = {
        plugins: ["sunset"],
        processor: "sunset/sunset-after-date",
        // ...other configuration
    };
    ```

3. **Example message**

    If an ESLint rule produces a message like:

    > `This API will be removed in 2030-01-01`

    - If today is 2030-01-01 or later, the warning will be treated as an error.
    - If today is before that date, it will remain a warning.

## Customizing the removal date regex

You can customize the regular expression used to extract the removal date from warning messages by providing the `removalRegex` option in your ESLint configuration:

```js
module.exports = {
    plugins: ["sunset"],
    processor: "sunset/sunset-after-date",
    processorOptions: {
        removalRegex: "sunset=(\\d{4}/\\d{2}/\\d{2})",
    },
};
```

This allows you to match custom message formats, for example:

> `Deprecated: sunset=2099/12/31`

-   If today is 2099/12/31 or later, the warning will be treated as an error.

## License

MIT
