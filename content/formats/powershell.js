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

this.options.header = ''+
'Param (\n'+
'[switch] $browser\n'+
')\n'+
'# http://stackoverflow.com/questions/8343767/how-to-get-the-current-directory-of-the-cmdlet-being-executed\n'+
'function Get-ScriptDirectory\n'+
'{\n'+
'$Invocation = (Get-Variable MyInvocation -Scope 1).Value;\n'+
'if($Invocation.PSScriptRoot)\n'+
'{\n'+
'$Invocation.PSScriptRoot;\n'+
'}\n'+
'Elseif($Invocation.MyCommand.Path)\n'+
'{\n'+
'Split-Path $Invocation.MyCommand.Path\n'+
'}\n'+
'else\n'+
'{\n'+
'$Invocation.InvocationName.Substring(0,$Invocation.InvocationName.LastIndexOf("\"));\n'+
'}\n'+
'}\n'+
'# http://poshcode.org/1942\n'+
'function Assert {\n'+
'[CmdletBinding()]\n'+
'param(\n'+
'[Parameter(Position=0,ParameterSetName="Script", Mandatory=$true)]\n'+
'[ScriptBlock]$Script,\n'+
'[Parameter(Position=0,ParameterSetName="Condition", Mandatory=$true)]\n'+
'[bool]$Condition,\n'+
'[Parameter(Position=1,Mandatory=$true)]\n'+
'[string]$message )\n'+
'$message = "ASSERT FAILED: $message"\n'+
'if($PSCmdlet.ParameterSetName -eq "Script") {\n'+
'try {\n'+
'$ErrorActionPreference = "STOP"\n'+
'$success = &$Script\n'+
'} catch {\n'+
'$success = $false\n'+
'$message = "$message`nEXCEPTION THROWN: $($_.Exception.GetType().FullName)"\n'+
'}\n'+
'}\n'+
'if($PSCmdlet.ParameterSetName -eq "Condition") {\n'+
'try {\n'+
'$ErrorActionPreference = "STOP"\n'+
'$success = $Condition\n'+
'} catch {\n'+
'$success = $false\n'+
'$message = "$message`nEXCEPTION THROWN: $($_.Exception.GetType().FullName)"\n'+
'}\n'+
'}\n'+
'if(!$success) {\n'+
'throw $message\n'+
'}\n'+
'} \n'+
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
'popd\n\n' + 
'$verificationErrors = new-object System.Text.StringBuilder\n' + 
'$phantomjs_executable_folder = "C:\\tools\\phantomjs"\n'+
'if ($PSBoundParameters["browser"]) {\n'+
'$selenium_driver_folder = "c:\\java\\selenium"\n'+
'start-process -filepath "C:\\Windows\\System32\\cmd.exe" -argumentlist "start cmd.exe /c ${selemium_driver_folder}\\hub.cmd"\n'+
'start-process -filepath "C:\\Windows\\System32\\cmd.exe" -argumentlist "start cmd.exe /c ${selemium_driver_folder}\\node.cmd"\n'+
'start-sleep 10\n\n'+
'$capability = [OpenQA.Selenium.Remote.DesiredCapabilities]::Firefox()\n'+
'$uri = [System.Uri]("http://127.0.0.1:4444/wd/hub")\n'+
'$selenium = new-object OpenQA.Selenium.Remote.RemoteWebDriver($uri , $capability)\n'+
'} else {\n'+
'$selenium = new-object OpenQA.Selenium.PhantomJS.PhantomJSDriver($phantomjs_executable_folder)\n'+
'$selenium.Capabilities.SetCapability("ssl-protocol", "any" )\n'+
'$selenium.Capabilities.SetCapability("ignore-ssl-errors", $true)\n'+
'$selenium.capabilities.SetCapability("takesScreenshot", $true )\n'+
'$selenium.capabilities.SetCapability("userAgent", "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.7 Safari/534.34")\n'+
'# currently unused\n'+
'$options = new-object OpenQA.Selenium.PhantomJS.PhantomJSOptions\n'+
'$options.AddAdditionalCapability("phantomjs.executable.path", $phantomjs_executable_folder)\n'+
'}\n'+
'# http://selenium.googlecode.com/git/docs/api/dotnet/index.html\n'+
'[void]$selenium.Manage().Timeouts().ImplicitlyWait( [System.TimeSpan]::FromSeconds(10 )) \n';
		
this.options.footer = "";
