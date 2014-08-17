Param (
[switch] $browser
)
# http://stackoverflow.com/questions/8343767/how-to-get-the-current-directory-of-the-cmdlet-being-executed
function Get-ScriptDirectory
{
$Invocation = (Get-Variable MyInvocation -Scope 1).Value;
if($Invocation.PSScriptRoot){
$Invocation.PSScriptRoot;
}
Elseif($Invocation.MyCommand.Path){
Split-Path $Invocation.MyCommand.Path
} else {
$Invocation.InvocationName.Substring(0,$Invocation.InvocationName.LastIndexOf(""));
}
}
$shared_assemblies = @(
"WebDriver.dll",
"WebDriver.Support.dll",
"Selenium.WebDriverBackedSelenium.dll"
)

$env:SHARED_ASSEMBLIES_PATH = "c:\developer\sergueik\csharp\SharedAssemblies"
$env:SCREENSHOT_PATH = "C:\developer\sergueik\powershell_ui_samples"
$shared_assemblies_path = $env:SHARED_ASSEMBLIES_PATH
pushd $shared_assemblies_path
$shared_assemblies | foreach-object { Unblock-File -Path $_ ; Add-Type -Path $_ }
popd

$verificationErrors = new-object System.Text.StringBuilder
$baseURL = "http://www.wikipedia.org"
$phantomjs_executable_folder = "C:\tools\phantomjs"
if ($PSBoundParameters["browser"]) {
try { 
$connection = (New-Object Net.Sockets.TcpClient)
$connection.Connect("127.0.0.1",4444)
$connection.Close()
} catch {
start-process -filepath "C:\Windows\System32\cmd.exe" -argumentlist "start cmd.exe /c c:\java\selenium\hub.cmd"
start-process -filepath "C:\Windows\System32\cmd.exe" -argumentlist "start cmd.exe /c c:\java\selenium\node.cmd"
start-sleep -seconds 10
}
$capability = [OpenQA.Selenium.Remote.DesiredCapabilities]::Chrome()
$uri = [System.Uri]("http://127.0.0.1:4444/wd/hub")
$selenium = new-object OpenQA.Selenium.Remote.RemoteWebDriver($uri , $capability)
} else {
$selenium = new-object OpenQA.Selenium.PhantomJS.PhantomJSDriver($phantomjs_executable_folder)
$selenium.Capabilities.SetCapability("ssl-protocol", "any" )
$selenium.Capabilities.SetCapability("ignore-ssl-errors", $true)
$selenium.capabilities.SetCapability("takesScreenshot", $true )
$selenium.capabilities.SetCapability("userAgent", "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.7 Safari/534.34")
$options = new-object OpenQA.Selenium.PhantomJS.PhantomJSOptions
$options.AddAdditionalCapability("phantomjs.executable.path", $phantomjs_executable_folder)
}
            $selenium.Navigate().GoToUrl("http://localhost:8080/")
            $selenium.FindElement([OpenQA.Selenium.By]::XPath("//div[@id='tasks']/div[2]")).Click()
# Cleanup
try {
$selenium.Quit()
} catch [Exception] {
# Ignore errors if unable to close the browser
}
