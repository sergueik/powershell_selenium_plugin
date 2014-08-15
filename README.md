=================================================
Name: WebDriver Backed Formatters
Version: 1.0.4
Requirements: Selenium IDE v1.0.5
=================================================

NOTE:
This is a alpha version plugin for Selenium IDE that adds WebDriver backed Selenium 
Powershell formatter, which allows users to run Powershell Selenium tests without the need to compile the test into assembly. The original WebDriver backed Selenium
formatter is kept in this xpi for crafting conversion side-by-side.
Currently the Powershell plugin is uses a replica of csharp-nunit-webdriver-backed.js  and its dependencies.

INSTALLATION:
1. Run build.bat (or build.sh on Linux).
2. Open webdriver-backed-formatters.xpi in Firefox.

REQUIREMENTS:
To build on Windows you will need 7-Zip and Robocopy
* 7-Zip - http://www.7-zip.org/
* Robocopy - http://en.wikipedia.org/wiki/Robocopy

CREDITS:
* Adam Goucher - Author of the Selenium IDE plugin API 
* Dave Hunt - Created the WebDriver Backed Selenium (Java) client formatters
* Justin Spradlin - Created the WebDriver Backed Selenium (C#) client formatters

GETTING INVOLVED:
https://github.com/davehunt/selenium-ide-webdriver-backed-formatters
This plugin is not complete, but should at least provide basic working 
formatters. See the issues list if you're interested in contributing.
