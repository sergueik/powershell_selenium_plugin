/*
 * Powershell Selenium Remote Control Formatter 
 */

load('remoteControl.js');

this.name = 'Powershell (Remote Control)';

function testMethodName(testName) {
	return 'The' + capitalize(testName) + 'Test';
}

NotEquals.prototype.assert = function() {
	return '[NUnit.Framework.Assert]::AreNotEqual(' + this.e1.toString() + ', ' + this.e2.toString() + ')';

};

function assertTrue(expression) {
	return '[NUnit.Framework.Assert]::IsTrue(' + expression.toString() + ')';
}

function assertFalse(expression) {
	return '[NUnit.Framework.Assert]::IsFalse(' + expression.toString() + ')';
}

this.options.header = 
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
     indents(1) + '"ThoughtWorks.Selenium.Core.dll",\n'+
     indents(1) + '"nunit.core.dll",\n'+
     indents(1) + '"nunit.framework.dll"\n'+
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
     '}\n' +
     // show usage ...
     indents(1) + '# $selenium = new-object Selenium.DefaultSelenium("localhost", 4444, "*firefox", "http://www.wikipedia.org/") \n' + 
     indents(1) + '# $selenium.Start() \n' + 
     indents(1) + '# $selenium.Open("/") \n' + 
     indents(1) + '# $selenium.Click("css=strong") \n' + 
     indents(1) + '# $selenium.Click("link=Selenium (software)") \n' + 
     indents(1) + '# $selenium.Click("id=searchButton") \n' + 
     indents(1) + '# $selenium.WaitForPageToLoad("30000") \n' + 
     indents(1) + '# $selenium.Click("id=searchButton") \n' + 
     indents(1) + '# [NUnit.Framework.Assert]::AreEqual($selenium.GetTitle(), "Selenium (software) - Wikipedia, the free encyclopedia") \n' +
     '\n' ; 

this.options.footer = 
     '# Cleanup\n' +
     'try {\n' +
     indents(1) + '$selenium.Quit()\n' +
     '} catch [Exception] {\n' +
     indents(1) + '# Ignore errors if unable to close the browser\n' +
          '}\n';		


this.options = {
    receiver: "selenium",
	driver_namespace: "OpenQA.Selenium.Firefox",
	driver_implementation: "FirefoxDriver()",
	test_namespace: "SeleniumTests",
    indent:	'tab',
    initialIndents:	'3'
};

this.configForm =
    	'<description>Test Namespace</description>' +
    	'<textbox id="options_test_namespace" />' +
		'<description>Variable for Selenium instance name</description>' +
    	'<textbox id="options_receiver" />' +
		'<description>WebDriver Namespace</description>' +
		'<menulist id="options_driver_namespace"><menupopup>' +
		'<menuitem label="OpenQA.Selenium.Firefox" value="OpenQA.Selenium.Firefox"/>' +
		'<menuitem label="OpenQA.Selenium.Chrome" value="OpenQA.Selenium.Chrome"/>' +
		'<menuitem label="OpenQA.Selenium.IE" value="OpenQA.Selenium.IE"/>' +
		'</menupopup></menulist>' +
		'<description>WebDriver Implementation</description>' +
		'<menulist id="options_driver_implementation"><menupopup>' +
		'<menuitem label="Firefox" value="FirefoxDriver()"/>' +
		'<menuitem label="Google Chrome" value="ChromeDriver()"/>' +
		'<menuitem label="Internet Explorer" value="InternetExplorerDriver()"/>' +
		'</menupopup></menulist>'; 
function verify(statement) {
	return "try\n" +
	  "{\n" +
	  indents(1) + statement + "\n" +
	  "}\n" +
	  "catch (AssertionException e)\n" +
	  "{\n" +
	  indents(1) + "verificationErrors.Append(e.Message);\n" +
	  "}";
}

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

function verifyTrue(expression) {
	return verify(assertTrue(expression));
}

function verifyFalse(expression) {
	return verify(assertFalse(expression));
}

function joinExpression(expression) {
    return "String.Join(\",\", " + expression.toString() + ")";
}

function assignToVariable(type, variable, expression) {
	return capitalize(type) + " " + variable + " = " + expression.toString();
}

function waitFor(expression) {
	return "for (int second = 0;; second++) {\n" +
	  indents(1) + 'if (second >= 60) Assert.Fail("timeout");\n' +
	  indents(1) + "try\n" +
	  indents(1) + "{\n" +
	  (expression.setup ? indents(2) + expression.setup() + "\n" : "") +
	  indents(2) + "if (" + expression.toString() + ") break;\n" +
	  indents(1) + "}\n" +
	  indents(1) + "catch (Exception)\n" +
	  indents(1) + "{}\n" +
	  indents(1) + "Thread.Sleep(1000);\n" +
	  "}";
}

function assertOrVerifyFailure(line, isAssert) {
	var message = '"expected failure"';
	var failStatement = isAssert ? "Assert.Fail(" + message + ");" : 
		"verificationErrors.Append(" + message + ");";
	return "try\n" +
	  "{\n" +
		line + "\n" +
		failStatement + "\n" +
	  "}\n" +
	  "catch (Exception) {}\n";
}

Equals.prototype.toString = function() {
	return this.e1.toString() + " == " + this.e2.toString();
};

NotEquals.prototype.toString = function() {
	return this.e1.toString() + " != " + this.e2.toString();
};

Equals.prototype.assert = function() {
	return "Assert.AreEqual(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

Equals.prototype.verify = function() {
	return verify(this.assert());
};

NotEquals.prototype.verify = function() {
	return verify(this.assert());
};

RegexpMatch.prototype.toString = function() {
	return "Regex.IsMatch(" + this.expression + ", " + string(this.pattern) + ")";
};

function pause(milliseconds) {
	return "Thread.Sleep(" + parseInt(milliseconds, 10) + ");";
}

function echo(message) {
	return "Console.WriteLine(" + xlateArgument(message) + ");";
}

function statement(expression) {
	return expression.toString() + ';';
}

function array(value) {
	var str = 'new String[] {';
	for (var i = 0; i < value.length; i++) {
		str += string(value[i]);
		if (i < value.length - 1) str += ", ";
	}
	str += '}';
	return str;
}

function nonBreakingSpace() {
    return "\"\\u00a0\"";
}

CallSelenium.prototype.toString = function() {
	var result = '';
	if (this.negative) {
		result += '!';
	}
	if (options.receiver) {
		result += options.receiver + '.';
	}
	result += capitalize(this.message);
	result += '(';
	for (var i = 0; i < this.args.length; i++) {
		result += this.args[i];
		if (i < this.args.length - 1) {
			result += ', ';
		}
	}
	result += ')';
	return result;
};

function formatComment(comment) {
	return comment.comment.replace(/.+/mg, function(str) {
			return "// " + str;
		});
}
