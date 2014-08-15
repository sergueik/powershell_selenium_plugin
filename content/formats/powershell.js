/*
 * Format for Selenium WebDriver Backed .NET (C#) client (NUnit)
 */

load('chrome://webdriver-backed-formatters/content/formats/powershell-base.js');
load('chrome://webdriver-backed-formatters/content/formats/powershell-webdriver-backed-base.js');

this.name = "powershell";

function testMethodName(testName) {
	return "The" + capitalize(testName) + "Test";
}

NotEquals.prototype.assert = function() {
	return "Assert.AreNotEqual(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

function assertTrue(expression) {
	return "Assert.IsTrue(" + expression.toString() + ");";
}

function assertFalse(expression) {
	return "Assert.IsFalse(" + expression.toString() + ");";
}

this.options.header = 
'$shared_assemblies = @(\n'+
'"WebDriver.dll",\n'+
'"WebDriver.Support.dll",\n'+
'"Selenium.WebDriverBackedSelenium.dll",\n'+
'"ThoughtWorks.Selenium.Core.dll",\n'+
'"ThoughtWorks.Selenium.UnitTests.dll",\n'+
'"ThoughtWorks.Selenium.IntegrationTests.dll",\n'+
'"Moq.dll"\n'+
')\n'+
'$env:SHARED_ASSEMBLIES_PATH = "c:\\developer\\sergueik\\csharp\\SharedAssemblies"\n'+
'$env:SCREENSHOT_PATH = "C:\\developer\\sergueik\\powershell_ui_samples"\n'+
'$shared_assemblies_path = $env:SHARED_ASSEMBLIES_PATH\n'+
'$screenshot_path = $env:SCREENSHOT_PATH\n'+
'pushd $shared_assemblies_path\n'+
'$shared_assemblies | foreach-object { Unblock-File -Path $_ ; Add-Type -Path $_ }\n' +
'popd\n\n';
		
this.options.footer = 
    	indents(2) + '}\n' +
    	indents(1) + '}\n' +
    	'}\n';
