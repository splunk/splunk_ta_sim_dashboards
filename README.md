# Splunk SignalFX Dashboards App

## Prerequisite 
* Install [nodejs](https://nodejs.org/en/) 10.x.
* Install Splunk Enterprise locally and have $SPLUNK_HOME env variable setup.
* In Windows environment, to avoid any file permission issues start the command prompt with "Run as Administrator" to run the commands mentioned in the [Development](#development) section.

## Development
* `npm install` - install dependencies.
* `npm run dev` - start the project in dev mode. This command will symlink the project into your Splunk instance. 
* Restart your Splunk instance if it's the first time you setup this project. `Dashboard Examples .Conf 2019` application should shows up in app bar.


## How to create a new page
* Add an xml file in `resources/default/data/ui/views`.
* Modify `resources/default/data/ui/nav/default.xml` to include your new page.
* Create a new folder under `src/pages/` with the same name of the new xml file.
* Create `index.jsx` import `BaseDashboard` from `src/components` and bootstrap the page using `@splunk/react-page`, 
* Add the default definition for the page in `src/definitions` and an export for it in `src/definitions/index.js`.
* Restart Splunk, your new page should shows up.


# Package the app

Use the following steps to package the Dashboard app. 

Requirements:
* Make
* [Docker](https://docs.docker.com/install/)

Steps:
* Run `make build-image` to build the image to package the app.
* Run `make run` to package the app with NodeJS.
    * The app (`tgz`) will be created in the `splunkapps` folder.
* To start Splunk (`8.0`) with the dashboard app run `make start` (username: `admin` password: `changemeplease1`).
* Remove all containers run `make down`
