/*
 * Formatter for Powershell / WebDriver / Firefox client.
 */
 
var subScriptLoader = Components.classes['@mozilla.org/moz/jssubscript-loader;1'].getService(Components.interfaces.mozIJSSubScriptLoader);
subScriptLoader.loadSubScript('chrome://selenium-ide/content/formats/webdriver.js', this);
 
function testClassName(testName) {
  return testName.split(/[^0-9A-Za-z]+/).map(
      function(x) {
        return capitalize(x);
      }).join('');
}
 
function testMethodName(testName) {
  return 'The' + capitalize(testName) + 'Test';
}
 
function nonBreakingSpace() {
  return "\"\\u00a0\"";
}
 
function array(value) {
  var str = '@(';
  for (var i = 0; i < value.length; i++) {
    str += string(value[i]);
    if (i < value.length - 1) str += ', ';
  }
  str += ')';
  return str;
}
 
Equals.prototype.toString = function() {
  return this.e1.toString() + ' -eq ' + this.e2.toString();
};
 
Equals.prototype.assert = function() {
  return '[NUnit.Framework.Assert]::AreEqual(' + this.e1.toString() + ', ' + this.e2.toString() + ');';
};
 
Equals.prototype.verify = function() {
  return verify(this.assert());
};
 
NotEquals.prototype.toString = function() {
  return this.e1.toString() + ' -ne ' + this.e2.toString();
};
 
NotEquals.prototype.assert = function() {
  return '[NUnit.Framework.Assert]::AreNotEqual(' + this.e1.toString() + ', ' + this.e2.toString() +  ');';
};
 
NotEquals.prototype.verify = function() {
  return verify(this.assert());
};
 
function joinExpression(expression) {
  return '[String]::Join(",", ' + expression.toString() + ')';
}
 
function statement(expression) {
  return expression.toString();
}
 
function assignToVariable(type, variable, expression) {
  return capitalize(type) + ' ' + variable + ' = ' + expression.toString();
}
 
function ifCondition(expression, callback) {
  return 'if (' + expression.toString() + ")\n{\n" + callback() + "\n}\n";
}
 
function assertTrue(expression) {
  return '[NUnit.Framework.Assert]::IsTrue(' + expression.toString() + ')';
}
 
function assertFalse(expression) {
  return '[NUnit.Framework.Assert]::IsFalse(' + expression.toString() + ')';
}
 
function verify(statement) {
  return "try\n" +
      "{\n" +
      indents(1) + statement + "\n" +
      "}\n" +
      "catch [NUnit.Framework.AssertionException $e]\n" +
      "{\n" +
      indents(1) + "$verificationErrors.Append($e.Message);\n" +
      '}';
}
 
function verifyTrue(expression) {
  return verify(assertTrue(expression));
}
 
function verifyFalse(expression) {
  return verify(assertFalse(expression));
}
 
RegexpMatch.patternToString = function(pattern) {
  if (pattern != null) {
    //value = value.replace(/^\s+/, '');
    //value = value.replace(/\s+$/, '');
    pattern = pattern.replace(/\\/g, '\\\\');
    pattern = pattern.replace(/\"/g, '\\"');
    pattern = pattern.replace(/\r/g, '\\r');
    pattern = pattern.replace(/\n/g, '(\\n|\\r\\n)');
    return '"' + pattern + '"';
  } else {
    return '""';
  }
};
 
RegexpMatch.prototype.toString = function() {
  return '[System.Text.RegularExpressions.Regex]::IsMatch(' + this.expression + ', ' + RegexpMatch.patternToString(this.pattern) + ')';
};
 
function waitFor(expression) {
  return "for ([int] $second = 0;; $second++) {\n" +
      indents(1) + 'if ($second -gt 60) [NUnit.Framework.Assert]::Fail("timeout");\n' +
      indents(1) + "try\n" +
      indents(1) + "{\n" +
      (expression.setup ? indents(2) + expression.setup() + "\n" : "") +
      indents(2) + "if (" + expression.toString() + ") break;\n" +
      indents(1) + "}\n" +
      indents(1) + "catch [Exception]\n" +
      indents(1) + "{}\n" +
      indents(1) + "Thread.Sleep(1000)\n" +
      "}";
}
 
function assertOrVerifyFailure(line, isAssert) {
  var message = '"expected failure"';
  var failStatement = isAssert ? "[NUnit.Framework.Assert]::Fail(" + message + ")" :
      "$verificationErrors.Append(" + message + ")";
  return "try\n" +
      "{\n" +
      line + "\n" +
      failStatement + "\n" +
      "}\n" +
      "catch [Exception] {}\n";
}
 
function pause(milliseconds) {
  return '[System.Threading.Thread]::Sleep(' + parseInt(milliseconds, 10) + ')';
}
 
function echo(message) {
  return 'write-output' + xlateArgument(message) + ')';
}
 
function formatComment(comment) {
  return comment.comment.replace(/.+/mg, function(str) {
    return '# ' + str;
  });
}
 
/**
 * Returns a string representing the suite for this formatter language.
 *
 * @param testSuite  the suite to format
 * @param filename   the file the formatted suite will be saved as
 */
function formatSuite(testSuite, filename) {
  var suiteClass = /^(\w+)/.exec(filename)[1];
  suiteClass = suiteClass[0].toUpperCase() + suiteClass.substring(1);
 
  var formattedSuite = "\n";
 
  for (var i = 0; i < testSuite.tests.length; ++i) {
    var testClass = testSuite.tests[i].getTitle();
    formattedSuite += indents(4)
        + 'suite.Add(new ' + testClass + "());\n";
  }
 
  formattedSuite += indents(4) + "return suite;\n"
      + indents(3) + "}\n"
      + indents(2) + "}\n"
      + indents(1) + "}\n"
      + "}\n";
 
  return formattedSuite;
}
 
function defaultExtension() {
  return this.options.defaultExtension;
}
 
this.options = {
  receiver: '$selenium',
  base_url: 'http://docs.seleniumhq.org/docs/02_selenium_ide.jsp',
  driver_namespace: "OpenQA.Selenium.Firefox",
  driver_capabilities: "Firefox()",
  showSelenese: 'false',
  baseclass: 'BaseTest',
  indent: '4',
  initialIndents:  '3',
  header:
     'Param (\n'+
     indents(1) + '[switch] $browser\n'+
     ')\n'+
     '# http://stackoverflow.com/questions/8343767/how-to-get-the-current-directory-of-the-cmdlet-being-executed\n'+
     'function Get-ScriptDirectory\n'+
     '{\n'+
     indents(1) + '$Invocation = (Get-Variable MyInvocation -Scope 1).Value\n'+
     indents(1) + 'if ($Invocation.PSScriptRoot) {\n'+
     indents(2) + '$Invocation.PSScriptRoot\n'+
     indents(1) + '}\n'+
     indents(1) + 'Elseif ($Invocation.MyCommand.Path) {\n'+
     indents(2) + 'Split-Path $Invocation.MyCommand.Path\n'+
     indents(1) + '} else {\n'+
     indents(2) + '$Invocation.InvocationName.Substring(0,$Invocation.InvocationName.LastIndexOf("\"))\n'+
     indents(1) + '}\n'+
     '}\n'+
     '$shared_assemblies = @(\n'+
     indents(1) + '"WebDriver.dll",\n'+
     indents(1) + '"WebDriver.Support.dll",\n'+
     indents(1) + '"Selenium.WebDriverBackedSelenium.dll"\n'+
     indents(1) + ')\n\n'+
     '$env:SHARED_ASSEMBLIES_PATH = "c:\\developer\\sergueik\\csharp\\SharedAssemblies"\n'+
     '$env:SCREENSHOT_PATH = "C:\\developer\\sergueik\\powershell_ui_samples"\n'+
     '$shared_assemblies_path = $env:SHARED_ASSEMBLIES_PATH\n'+
     'pushd $shared_assemblies_path\n'+
     indents(1) + '$shared_assemblies | foreach-object { Unblock-File -Path $_ ; Add-Type -Path $_ }\n' +
     'popd\n\n' + 
     '$verificationErrors = new-object System.Text.StringBuilder\n' + 
     '$baseURL = "${base_url}"\n' +
     '$phantomjs_executable_folder = "C:\\tools\\phantomjs"\n'+
     'if ($PSBoundParameters["browser"]) {\n'+
     indents(1) + 'try { \n' + 
     indents(2) + '$connection = (New-Object Net.Sockets.TcpClient)\n' + 
     indents(2) + '$connection.Connect("127.0.0.1",4444)\n' + 
     indents(2) + '$connection.Close()\n' + 
     indents(1) + '} catch {\n' + 
     indents(2) + 'start-process -filepath "C:\\Windows\\System32\\cmd.exe" -argumentlist "start cmd.exe /c ' + 'c:\\java\\selenium\\hub.cmd"\n'+
     indents(2) + 'start-process -filepath "C:\\Windows\\System32\\cmd.exe" -argumentlist "start cmd.exe /c ' + 'c:\\java\\selenium\\node.cmd"\n'+
     indents(2) + 'start-sleep -seconds 10\n' +
     indents(1) + '}\n' +
     indents(1) + '$capability = [OpenQA.Selenium.Remote.DesiredCapabilities]::${driver_capabilities}\n'+
     indents(1) + '$uri = [System.Uri]("http://127.0.0.1:4444/wd/hub")\n'+
     indents(1) + '$selenium = new-object OpenQA.Selenium.Remote.RemoteWebDriver($uri , $capability)\n'+
     '} else {\n'+
     indents(1) + '$selenium = new-object OpenQA.Selenium.PhantomJS.PhantomJSDriver($phantomjs_executable_folder)\n'+
     indents(1) + '$selenium.Capabilities.SetCapability("ssl-protocol", "any" )\n'+
     indents(1) + '$selenium.Capabilities.SetCapability("ignore-ssl-errors", $true)\n'+
     indents(1) + '$selenium.capabilities.SetCapability("takesScreenshot", $true )\n'+
     indents(1) + '$selenium.capabilities.SetCapability("userAgent", "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.7 Safari/534.34")\n'+
     indents(1) + '$options = new-object OpenQA.Selenium.PhantomJS.PhantomJSOptions\n'+
     indents(1) + '$options.AddAdditionalCapability("phantomjs.executable.path", $phantomjs_executable_folder)\n'+
     '}\n',
  footer:
     '# Cleanup\n' +
     'try {\n' +
     indents(1) + '$selenium.Quit()\n' +
     '} catch [Exception] {\n' +
     indents(1) + '# Ignore errors if unable to close the browser\n' +
          '}\n',
  defaultExtension: 'ps1'
};


this.configForm =
	'<description>Selenium instance name</description>' +
	'<textbox id="options_receiver" />' +
	'<description>WebDriver Capabilities</description>' +
	'<menulist id="options_driver_capabilities"><menupopup>' +
	'<menuitem label="Firefox" value="Firefox()"/>' +
	'<menuitem label="Google Chrome" value="Chrome()"/>' +
	'<menuitem label="Safari" value="Safari()"/>' +
	'<menuitem label="Internet Explorer" value="InternetExplorer()"/>' +
	'</menupopup></menulist>'+ 
	'<description>Base URL</description>' +
	'<textbox id="options_base_url" />' +
	'<checkbox id="options_showSelenese" label="Show Selenese"/>';
 
this.name = 'Powershell (WebDriver) / Firefox';
this.webdriver = true;
 
WDAPI.Driver = function() {
  this.ref = options.receiver;
};
 
WDAPI.Driver.searchContext = function(locatorType, locator) {
  var locatorString = xlateArgument(locator);
  switch (locatorType) {
    case 'xpath':
      return '[OpenQA.Selenium.By]::XPath(' + locatorString + ')';
    case 'css':
      return '[OpenQA.Selenium.By]::CssSelector(' + locatorString + ')';
    case 'id':
      return '[OpenQA.Selenium.By]::Id(' + locatorString + ')';
    case 'link':
      return '[OpenQA.Selenium.By]::LinkText(' + locatorString + ')';
    case 'name':
      return '[OpenQA.Selenium.By]::Name(' + locatorString + ')';
    case 'tag_name':
      return '[OpenQA.Selenium.By]::TagName(' + locatorString + ')';
  }
  throw 'Error: unknown strategy [' + locatorType + '] for locator [' + locator + ']';
};
 
WDAPI.Driver.prototype.back = function() {
  return this.ref + '.Navigate().Back()';
};
 
WDAPI.Driver.prototype.close = function() {
  return this.ref + '.Close()';
};
 
WDAPI.Driver.prototype.findElement = function(locatorType, locator) {
  return new WDAPI.Element(this.ref + '.FindElement(' + WDAPI.Driver.searchContext(locatorType, locator) + ')');
};
 
WDAPI.Driver.prototype.findElements = function(locatorType, locator) {
  return new WDAPI.ElementList(this.ref + '.FindElements(' + WDAPI.Driver.searchContext(locatorType, locator) + ')');
};
 
WDAPI.Driver.prototype.getCurrentUrl = function() {
  return this.ref + '.Url';
};
 
WDAPI.Driver.prototype.get = function(url) {
  if (url.length > 1 && (url.substring(1,8) == 'http://' || url.substring(1,9) == 'https://')) { // url is quoted
    return this.ref + '.Navigate().GoToUrl(' + url + ')';
  } else {
    return this.ref + '.Navigate().GoToUrl($baseURL + ' + url + ')';
  }
};
 
WDAPI.Driver.prototype.getTitle = function() {
  return this.ref + '.Title';
};

// TODO: implicitlyWait 
// TODO: getWindowHandle
// TODO 
WDAPI.Driver.prototype.getAlert = function() {
  return 'CloseAlertAndGetItsText()';
};
 
WDAPI.Driver.prototype.chooseOkOnNextConfirmation = function() {
  return '$acceptNextAlert = $true';
};
 
WDAPI.Driver.prototype.chooseCancelOnNextConfirmation = function() {
  return '$acceptNextAlert = $false';
};
 
WDAPI.Driver.prototype.refresh = function() {
  return this.ref + '.Navigate().Refresh()';
};
 
WDAPI.Element = function(ref) {
  this.ref = ref;
};
 
WDAPI.Element.prototype.clear = function() {
  return this.ref + '.Clear()';
};
 
WDAPI.Element.prototype.click = function() {
  return this.ref + '.Click()';
};
 
WDAPI.Element.prototype.getAttribute = function(attributeName) {
  return this.ref + '.GetAttribute(' + xlateArgument(attributeName) + ')';
};
 
WDAPI.Element.prototype.getText = function() {
  return this.ref + '.Text';
};
 
WDAPI.Element.prototype.isDisplayed = function() {
  return this.ref + '.Displayed';
};
 
WDAPI.Element.prototype.isSelected = function() {
  return this.ref + '.Selected';
};
 
WDAPI.Element.prototype.sendKeys = function(text) {
  return this.ref + '.SendKeys(' + xlateArgument(text) + ')';
};
 
WDAPI.Element.prototype.submit = function() {
  return this.ref + '.Submit()';
};
 
WDAPI.Element.prototype.select = function(label) {
  return 'new-object OpenQA.Selenium.Support.UI.SelectElement(' + this.ref + ').SelectByText(' + xlateArgument(label) + ')';
};
 
WDAPI.ElementList = function(ref) {
  this.ref = ref;
};
 
WDAPI.ElementList.prototype.getItem = function(index) {
  return this.ref + '[' + index + ']';
};
 
WDAPI.ElementList.prototype.getSize = function() {
  return this.ref + '.Count';
};
 
WDAPI.ElementList.prototype.isEmpty = function() {
  return this.ref + '.Count -eq 0';
};
 
WDAPI.Utils = function() {
};
 
WDAPI.Utils.isElementPresent = function(how, what) {
  return '[Selenium.Internal.SeleniumEmulation]::IsElementPres(' + WDAPI.Driver.searchContext(how, what) + ')';
};
