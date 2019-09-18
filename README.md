# Money Flow Index Signal Analysis
Author: Myles Wardell

Version: 1.0.0

## Installation

To install node modules use the [npm](https://www.npmjs.com/) command.

```cmd
npm install
```

## Setup

- Download MySQL Workbench - [here](https://dev.mysql.com/downloads/workbench/)

- Download NodeJS - [here](https://nodejs.org/en/)

- Create MySQL server with SQL Config paramaters

- Set environemnt variables to your SQL database using

Mac/Linux
```bash
SQL_PASSWORD='yourpasswordhere'
```


Windows
```cmd
set SQL_PASSWORD=yourpasswordhere
```

## Config

App Config: 

Config        | Defaults
---           | --- 
port          | 3000 
defaultPeriod | 14 
updateTickers | true

- defaultPeriod: Number of days used for MFI calculation
- updateTickers: false to disable database updates 

SQL Config:

Connection | Defaults 
---        | ---     
host       | 127.0.0.1
user       | root
password   | 12345678
database   | tickers




## Usage

To run application type.

```cmd
npm start
```

## Dependencies
- mySQL
- request
- request-promise

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)