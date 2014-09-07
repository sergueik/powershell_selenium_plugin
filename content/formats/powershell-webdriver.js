/*
 * Formatter for Powershell / WebDriver / Firefox client.
 */
if (!this.formatterType) {  
  var subScriptLoader = Components.classes['@mozilla.org/moz/jssubscript-loader;1'].getService(Components.interfaces.mozIJSSubScriptLoader);
  subScriptLoader.loadSubScript('chrome://selenium-ide/content/formats/webdriver.js', this);
  subScriptLoader.loadSubScript('chrome://selenium-ide/content/testCase.js', this);
}

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
 
function notOperator() {
  return '-not ';
}

function logicalAnd(conditions) {
  return conditions.join(" -and ");
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


function concatString(array) {
  return '(' + array.join(' + ') + ')';
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
  return '[NUnit.Framework.Assert]::AreNotEqual(' + this.e1.toString() + ', ' + this.e2.toString() +  ')';
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
//  TODO Example:
// [NUnit.Framework.Assert]::IsTrue($selenium.findElements([OpenQA.Selenium.By]::Id("hplogo")).count -ne 0) 
function assertTrue(expression) {
  return '[NUnit.Framework.Assert]::IsTrue(' + expression.toString() + ')';
}
 
function assertFalse(expression) {
  return '[NUnit.Framework.Assert]::IsFalse(' + expression.toString() + ')';
}
 
function verify(statement) {
  return 'try {\n' +
      indents(1) + statement + "\n" +
      "} catch [NUnit.Framework.AssertionException] {\n" +
      indents(1) + "$verificationErrors.Append( $_.Exception.Message )\n" +
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
  return 'for ([int] $second = 0;; $second++) {\n' +
      indents(1) + 'if ( $second -gt 60 )\n' +
      indents(2) + '{\n' +
      indents(3) + '[NUnit.Framework.Assert]::Fail( "timeout" )\n'  +
      indents(2) + '}\n' +
      indents(1) + 'try\n' +
      indents(1) + '{\n' +
      (expression.setup ? indents(2) + expression.setup() + '\n' : '') +
      indents(2) + 'if (' + expression.toString() + ')\n' +
      indents(3) + '{\n' +
      indents(4) + 'break\n' +
      indents(3) + '}\n' +
      indents(1) + '}\n' +
      indents(1) + 'catch [Exception]\n' +
      indents(1) + '{}\n' +
      indents(1) + 'Start-Sleep -Seconds 1\n' +
      '}\n';
}
 
function assertOrVerifyFailure(line, isAssert) {
  var message = '"expected failure"';
  var failStatement = isAssert ? '[NUnit.Framework.Assert]::Fail(' + message + ')' :
      '$verificationErrors.Append(' + message + ')';
  return 'try\n' +
      '{\n' +
      line + 
      '\n' +
      failStatement + 
      '\n' +
      '}\n' +
      'catch [Exception] \n{\n\n}\n';
}
 
function pause(milliseconds) {
  return 'Start-Sleep -Milliseconds ' + parseInt(milliseconds, 10);
}
 
function echo(message) {
  return 'Write-Output (' + xlateArgument(message) +')\n';
}
 
function formatComment(comment) {
  return comment.comment.replace(/.+/mg, function(str) {
    return '# ' + str;
  });
}
 
function defaultExtension() {
  return this.options.defaultExtension;
}
 
this.options = {
  receiver: '$selenium',
  base_url: 'http://docs.seleniumhq.org/docs/02_selenium_ide.jsp',
  driver_namespace: 'OpenQA.Selenium.Firefox',
  driver_capabilities: 'Firefox()',
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
     indents(1) + '"Selenium.WebDriverBackedSelenium.dll",\n'+
     indents(1) + '"nunit.core.dll",\n'+
     indents(1) + '"nunit.framework.dll"\n'+
     indents(1) + ')\n\n'+
     '$env:SHARED_ASSEMBLIES_PATH = "c:\\developer\\sergueik\\csharp\\SharedAssemblies"\n'+
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
     '}\n' +
	indents(1) + '[System.Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms") | Out-Null\n' +
	indents(1) + '[System.Reflection.Assembly]::LoadWithPartialName("System.ComponentModel") | Out-Null\n'+
	indents(1) + '[System.Reflection.Assembly]::LoadWithPartialName("System.Data") | Out-Null\n'+
	indents(1) + '[System.Reflection.Assembly]::LoadWithPartialName("System.Drawing") | Out-Null\n'+
	indents(1) + '$selenium.Manage().Window.Position = New-Object System.Drawing.Point(0, 0)\n' +
     indents(1) + '$mainWindow = $selenium.CurrentWindowHandle\n' +
     indents(1) + '$windows = $selenium.WindowHandles\n'+
     indents(1) + '[bool]$acceptNextAlert = $false\n'+
     // show usage ...
     indents(1) + '# WebDriver script generated by Selenium IDE formatter\n'+
     indents(1) + '# example usage:\n'+
     indents(1) + '# $queryBox.SendKeys([OpenQA.Selenium.Keys]::ArrowDown)\n'+
     indents(1) + '# $queryBox.Submit()\n'+
     indents(1) + '# $selenium.FindElement([OpenQA.Selenium.By]::LinkText("Selenium (software)")).Click()\n'+
     indents(1) + '# $title =  $selenium.Title\n'+
     indents(1) + '# $selenium.Quit()\n'+

     '\n' , 

  footer:
     '# Cleanup\n' +
     'try {\n' +
     indents(1) + '$selenium.Quit()\n' +
     '} catch [Exception] {\n' +
     indents(1) + '# Ignore errors if unable to close the browser\n' +
          '}\n' +
     '[NUnit.Framework.Assert]::AreEqual($verificationErrors.Length, 0)',
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
	'<description>Indent</description>' +
	'<menulist id="options_indent"><menupopup>' +
	'<menuitem label="Tab" value="tab"/>' +
	'<menuitem label="1 space" value="1"/>' +
	'<menuitem label="2 spaces" value="2"/>' +
	'<menuitem label="3 spaces" value="3"/>' +
	'<menuitem label="4 spaces" value="4"/>' +
	'<menuitem label="5 spaces" value="5"/>' +
	'<menuitem label="6 spaces" value="6"/>' +
	'<menuitem label="7 spaces" value="7"/>' +
	'<menuitem label="8 spaces" value="8"/>' +
	'</menupopup></menulist>' +
	'<checkbox id="options_showSelenese" label="Show Selenese"/>';
 
this.name = 'Powershell (WebDriver)';
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
    // TODO: handle 'class'
    // the following code does not work:
    // case 'class':
    // return '[OpenQA.Selenium.By]::ClassName(' + locatorString + ')';
    // return this.ref + '.FindElementsByClassName(' + locatorString + ')[0]';
    // Error: unknown strategy [class]
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

WDAPI.Driver.prototype.runScript =  function(script) {
return '([OpenQA.Selenium.IJavaScriptExecutor]'  + this.ref + ').ExecuteScript(' + xlateArgument(script) + ')';
/*

<#
The following code will successfully run  executeAsyncScript under Powershell or c#:
[int]$timeout  =  ...
[String] $script = ... 
[void]$selenium.manage().timeouts().SetScriptTimeout([System.TimeSpan]::FromSeconds($timeout))

try {
[void]([OpenQA.Selenium.IJavaScriptExecutor]$selenium).executeAsyncScript($script);

} catch [OpenQA.Selenium.WebDriverTimeoutException]{

  [NUnit.Framework.Assert]::IsTrue(  $_.Exception.Message -match '(?:Timed out waiting for async script result|asynchronous script timeout)')
}

#>
*/
}; 


WDAPI.Driver.prototype.runScriptAndWait =  function(script) {
return '# --- \n([OpenQA.Selenium.IJavaScriptExecutor]'  + this.ref + ').ExecuteScript(' + xlateArgument(script) + ')';
};

WDAPI.Driver.prototype.rollup = function (name, args) {
  var rules = RollupManager.getInstance().getRollupRule(name).getExpandedCommands(args),
  steps = [],i;
  for (i = 0; i < rules.length; i++) {
    steps.push(formatCommand(rules[i]));
  }
  return steps.join('\n');
};

WDAPI.Driver.prototype.refresh = function() {
  return this.ref + '.Navigate().Refresh()';
};

WDAPI.Element = function(ref) {
  this.ref = ref;
};

WDAPI.Element.prototype.location = function() {
  return this.ref + '.Location';
};
 
WDAPI.Element.prototype.clear = function() {
  return this.ref + '.Clear()';
};
 
WDAPI.Element.prototype.click = function() {
  return this.ref + '.Click()';
};

WDAPI.Driver.prototype.switchWindow = function(name) {
  if(name == 'null')
	  return this.ref + ".SwitchTo().Window($mainWindow)";
  if(name == 'last')
	  return '$windows = $selenium.WindowHandles\n'+ 
          this.ref + '.SwitchTo().Window( $windows[$windows.Count - 1 ] )';
  return 'windowSwitch(' + xlateArgument(name.split('=')[1]) + ')';
};

WDAPI.Driver.prototype.selectPopup = function(name) {
  if(name == 'null')
	return this.ref + '.SwitchTo().Window($selenium.WindowHandles[$selenium.WindowHandles.Count-1])';
  if(name == '')
	return this.ref + '.SwitchTo().Window($selenium.WindowHandles[$selenium.WindowHandles.Count-1])';
  return 'windowSwitch(' + xlateArgument(name.split('=')[1]) + ')';
};

WDAPI.Driver.prototype.switchFrame = function(name) {
  if(name.split('=')[0] == 'index')
	return '$selenium.SwitchTo().Frame(' + name.split('=')[1] + ')';
  return this.ref + '.SwitchTo().Frame(' + xlateArgument(name) + ')';
};

WDAPI.Element.prototype.SelectedOption = function() {
  return new WDAPI.Element('New-Object OpenQA.Selenium.Support.UI.SelectElement(' + this.ref + ').SelectedOption');
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
 if (selectLocator.type == 'index') {
    return 'new-object OpenQA.Selenium.Support.UI.SelectElement(' + this.ref + ').SelectByIndex(' + selectLocator.string + ')';
  }
  if (selectLocator.type == 'value') {
    return 'new-object OpenQA.Selenium.Support.UI.SelectElement(' + this.ref + ').SelectByValue(' + xlateArgument(selectLocator.string) + ')';
  }
  return 'new-object OpenQA.Selenium.Support.UI.SelectElement(' + this.ref + ').SelectByText(' + xlateArgument(selectLocator.string) + ')';
};

WDAPI.Element.prototype.deselect = function(selectLocator) {
  if (selectLocator.type == 'index') {
    return 'new-object OpenQA.Selenium.Support.UI.SelectElement(' + this.ref + ').DeselectByIndex(' + selectLocator.string + ')';
  }
  if (selectLocator.type == 'value') {
    return 'new-object OpenQA.Selenium.Support.UI.SelectElement(' + this.ref + ').DeselectByValue(' + xlateArgument(selectLocator.string) + ')';
  }
  return 'new-object OpenQA.Selenium.Support.UI.SelectElement(' + this.ref + ').DeselectByText(' + xlateArgument(selectLocator.string) + ')';
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
 
// TODO: highlight
// http://assertselenium.com/2012/12/20/highlight-webelements-using-selenium-webdriver/

WDAPI.Utils.isElementPresent = function(how, what) {
  return '[Selenium.Internal.SeleniumEmulation]::IsElementPresent(' + WDAPI.Driver.searchContext(how, what) + ')';
};
 
SeleniumWebDriverAdaptor.prototype.runScript = function(x) {
  var driver = new WDAPI.Driver(),
  script = this.rawArgs[0];
  return driver.runScript(script);
};

SeleniumWebDriverAdaptor.prototype.runScriptAndWait = function(x) {
  var driver = new WDAPI.Driver(),
  script = this.rawArgs[0];
  return driver.runScriptAndWait(script);
};

SeleniumWebDriverAdaptor.prototype.setTimeout = function(x) {
timeout = this.rawArgs[0];
return '[void]$selenium.manage().timeouts().SetScriptTimeout([System.TimeSpan]::FromSeconds(' + timeout + '))';
};

WDAPI.Utils.getEval = function(script) {
return '(([OpenQA.Selenium.IJavaScriptExecutor]'  + this.ref + ').ExecuteScript(' + xlateArgument(script) + ')).ToString()';
};

SeleniumWebDriverAdaptor.prototype.rollup = function(name, args) {
  var rollupName = this.rawArgs[0],
  rollupArgs = this.rawArgs[1],
  driver = new WDAPI.Driver();
  return driver.rollup(rollupName, rollupArgs);
};

Command.prototype.getDefinition = function() {
	if (this.command == null) return null;
        // match
	var commandName = this.command.replace(/AndWait$/, '');
	commandName = this.command;
	var api = Command.loadAPI();
	var r = /^(assert|verify|store|waitFor)(.*)$/.exec(commandName);
	if (r) {
		var suffix = r[2];
		var prefix = "";
		if ((r = /^(.*)NotPresent$/.exec(suffix)) != null) {
			suffix = r[1] + "Present";
			prefix = "!";
		} else if ((r = /^Not(.*)$/.exec(suffix)) != null) {
			suffix = r[1];
			prefix = "!";
		}
		var booleanAccessor = api[prefix + "is" + suffix];
		if (booleanAccessor) {
			return booleanAccessor;
		}
		var accessor = api[prefix + "get" + suffix];
		if (accessor) {
			return accessor;
		}
	}
	return api[commandName];
}

