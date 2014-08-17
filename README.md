Powershell Webdriver Selenium Plugin
===================================
This is a Selenium Powershell formatter, which allows users to run Selenium tests recorded in IDE, in Powershell

It supports the following Selenium frameworks:

 * WebDriver
 * RC

Writing Tests
=============

Using the Selenium IDE, create your browser tests just like usual.
If you do not want to install XPI permanently,
* Select Options from the Options menu
* Select the "Formats" tab
* Click on the "Add" button
* Name the format
* Paste the content of the formatter file
* Click on the "Save" button
* In the "File" "Export Test Case as..." select the format you just added

If everything done right, the generated Powershell script will need no modifications and can be run right away. If you have a failing test and need assistance tuning it please email the test to kouzmine_serguei@yahoo.com


Special thanks
--------------
The code is derived from one of David Zwarg's Selenium C# formatters
(https://github.com/azavea/selenium-net-formatters)
