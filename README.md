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

The Powershell script assumes Selenium WebDriver and Nunit dlls
to be available in the path SHARED_ASSEMBLIES_PATH 
and Selenium java hub and node be started as Windows batch files hub.cmd and node.cmd respectively. If the latter is already listening on port 4444, no batch files are required.

For more invormation visit
author's article at CodeProject
http://www.codeproject.com/Articles/799161/Dealing-with-Powershell-Inputs-via-Basic-Windows-F#54C724BE37D04CE0AD9584606ACF5560

If everything done right, the generated Powershell script will need no modifications and can be run right away. If you have a failing test and need assistance tuning it please email the test to kouzmine_serguei@yahoo.com


Special thanks
--------------
The code is derived from one of David Zwarg's Selenium C# formatters
(https://github.com/azavea/selenium-net-formatters)
and Dave Hunt's formaters 
(https://github.com/davehunt/selenium-ide-webdriver-backed-formatters)

