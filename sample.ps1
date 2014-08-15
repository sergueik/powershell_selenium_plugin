Param (
[switch] $browser
)
# http://stackoverflow.com/questions/8343767/how-to-get-the-current-directory-of-the-cmdlet-being-executed
function Get-ScriptDirectory
{
$Invocation = (Get-Variable MyInvocation -Scope 1).Value;
if($Invocation.PSScriptRoot)
{
$Invocation.PSScriptRoot;
}
Elseif($Invocation.MyCommand.Path)
{
Split-Path $Invocation.MyCommand.Path
}
else
{
$Invocation.InvocationName.Substring(0,$Invocation.InvocationName.LastIndexOf(""));
}
}
# http://poshcode.org/1942
function Assert {
[CmdletBinding()]
param(
[Parameter(Position=0,ParameterSetName="Script", Mandatory=$true)]
[ScriptBlock]$Script,
[Parameter(Position=0,ParameterSetName="Condition", Mandatory=$true)]
[bool]$Condition,
[Parameter(Position=1,Mandatory=$true)]
[string]$message )
$message = "ASSERT FAILED: $message"
if($PSCmdlet.ParameterSetName -eq "Script") {
try {
$ErrorActionPreference = "STOP"
$success = &$Script
} catch {
$success = $false
$message = "$message`nEXCEPTION THROWN: $($_.Exception.GetType().FullName)"
}
}
if($PSCmdlet.ParameterSetName -eq "Condition") {
try {
$ErrorActionPreference = "STOP"
$success = $Condition
} catch {
$success = $false
$message = "$message`nEXCEPTION THROWN: $($_.Exception.GetType().FullName)"
}
}
if(!$success) {
throw $message
}
} 
$shared_assemblies = @(
"WebDriver.dll",
"WebDriver.Support.dll",
"Selenium.WebDriverBackedSelenium.dll",
"ThoughtWorks.Selenium.Core.dll",
"ThoughtWorks.Selenium.UnitTests.dll",
"ThoughtWorks.Selenium.IntegrationTests.dll",
"Moq.dll"
)
$env:SHARED_ASSEMBLIES_PATH = "c:\developer\sergueik\csharp\SharedAssemblies"
$env:SCREENSHOT_PATH = "C:\developer\sergueik\powershell_ui_samples"
$shared_assemblies_path = $env:SHARED_ASSEMBLIES_PATH
$screenshot_path = $env:SCREENSHOT_PATH
pushd $shared_assemblies_path
$shared_assemblies | foreach-object { Unblock-File -Path $_ ; Add-Type -Path $_ }
popd

$phantomjs_executable_folder = "C:\tools\phantomjs"
if ($PSBoundParameters["browser"]) {
$selemium_driver_folder = "c:\java\selenium"
start-process -filepath "C:\Windows\System32\cmd.exe" -argumentlist "start cmd.exe /c undefined\hub.cmd"
start-process -filepath "C:\Windows\System32\cmd.exe" -argumentlist "start cmd.exe /c undefined\node.cmd"
start-sleep 10

$capability = [OpenQA.Selenium.Remote.DesiredCapabilities]::Firefox()
$uri = [System.Uri]("http://127.0.0.1:4444/wd/hub")
$selenium = new-object OpenQA.Selenium.Remote.RemoteWebDriver($uri , $capability)
} else {
$selenium = new-object OpenQA.Selenium.PhantomJS.PhantomJSDriver($phantomjs_executable_folder)
$selenium.Capabilities.SetCapability("ssl-protocol", "any" )
$selenium.Capabilities.SetCapability("ignore-ssl-errors", $true)
$selenium.capabilities.SetCapability("takesScreenshot", $true )
$selenium.capabilities.SetCapability("userAgent", "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.7 Safari/534.34")
# currently unused
$options = new-object OpenQA.Selenium.PhantomJS.PhantomJSOptions
$options.AddAdditionalCapability("phantomjs.executable.path", $phantomjs_executable_folder)
}
# http://selenium.googlecode.com/git/docs/api/dotnet/index.html
[void]$selenium.Manage().Timeouts().ImplicitlyWait( [System.TimeSpan]::FromSeconds(10 )) 
			$selenium.Open("http://localhost:8080/");
			$selenium.Click("//div[@id='tasks']/div[2]");
			$selenium.WaitForPageToLoad("30000");
