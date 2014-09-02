/*
 * Formatter for Selenium 2 / WebDriver .NET (C#) client.
 */

var subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
subScriptLoader.loadSubScript('chrome://selenium-ide/content/formats/webdriver.js', this);

function testClassName(testName) {
  return testName.split(/[^0-9A-Za-z]+/).map(
      function(x) {
        return capitalize(x);
      }).join('');
}

function testMethodName(testName) {
  return "The" + capitalize(testName) + "Test";
}

function nonBreakingSpace() {
  return "\"\\u00a0\"";
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

Equals.prototype.toString = function() {
  return this.e1.toString() + " == " + this.e2.toString();
};

Equals.prototype.assert = function() {
  return "Assert.AreEqual(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

Equals.prototype.verify = function() {
  return verify(this.assert());
};

NotEquals.prototype.toString = function() {
  return this.e1.toString() + " != " + this.e2.toString();
};

NotEquals.prototype.assert = function() {
  return "Assert.AreNotEqual(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

NotEquals.prototype.verify = function() {
  return verify(this.assert());
};

function joinExpression(expression) {
  return "String.Join(\",\", " + expression.toString() + ")";
}

function statement(expression) {
  return expression.toString() + ';';
}

function assignToVariable(type, variable, expression) {
  return capitalize(type) + " " + variable + " = " + expression.toString();
}

function ifCondition(expression, callback) {
  return "if (" + expression.toString() + ")\n{\n" + callback() + "}";
}

function assertTrue(expression) {
	//Phase 2/7/2013
	//if(expression.toString().indexOf("CloseAlertAndGetItsText")!=-1)
	//	return "Assert.IsTrue(" + expression.toString() + ".Length>0);";
  return "Assert.IsTrue(" + expression.toString() + ");";
}

function assertFalse(expression) {
  return "Assert.IsFalse(" + expression.toString() + ");";
}

function verify(statement) {
  return "try\n" +
      "{\n" +
      indents(1) + statement + "\n" +
      "}\n" +
      "catch (AssertionException e)\n" +
      "{\n" +
      indents(1) + "verificationErrors.Append(\"Error verifying item in "+statement.replace(/\\\"/g,"\"").replace(/\"/g,"\\\"")+"\\n\");\n" +
      "}";
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
  return "Regex.IsMatch(" + this.expression + ", " + RegexpMatch.patternToString(this.pattern) + ")";
};

function waitFor(expression) {
  return "for (int second = 0;; second++) {\n" +
      indents(1) + 'if (second >= 30) Assert.Fail("timeout in '+expression.toString().replace(/\\\"/g,"\"").replace(/\"/g,"\\\"")+'");\n' +
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

function pause(milliseconds) {
  return "Thread.Sleep(" + parseInt(milliseconds, 10) + ");";
}

function echo(message) {
  return "Console.WriteLine(" + xlateArgument(message) + ");";
}

function formatComment(comment) {
  return comment.comment.replace(/.+/mg, function(str) {
    return "// " + str;
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

  var formattedSuite = "using NUnit.Framework;\n"
      + "using NUnit.Core;\n"
      + "\n"
      + "namespace " + this.options.namespace + "\n"
      + '{\n'
      + indents(1) + "public class " + suiteClass + "\n"
      + indents(1) + '{\n'
      + indents(2) + "[Suite] public static TestSuite Suite\n"
      + indents(2) + '{\n'
      + indents(3) + "get\n"
      + indents(3) + '{\n'
      + indents(4) + 'TestSuite suite = new TestSuite("'+ suiteClass +'");\n';

  for (var i = 0; i < testSuite.tests.length; ++i) {
    var testClass = testSuite.tests[i].getTitle();
    formattedSuite += indents(4)
        + "suite.Add(new " + testClass + "());\n";
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
  receiver: "driver",
  showSelenese: 'false',
  namespace: "SeleniumTests",
  indent: '4',
  initialIndents:  '3',
  header:
		  '//NDSeleniumVersion 1.10.21\n'+
		  'using System;\n' +
          'using System.Text;\n' +
          'using System.Text.RegularExpressions;\n' +
          'using System.Threading;\n' +
          'using NUnit.Framework;\n' +
          'using OpenQA.Selenium;\n' +
          'using OpenQA.Selenium.Interactions;\n' +
          'using OpenQA.Selenium.Firefox;\n' +
          'using OpenQA.Selenium.Support.UI;\n' +
		  'using System.Windows.Forms;\n'+
          'using System.Drawing;\n'+
          '\n' +
          'namespace ${namespace}\n' +
          '{\n' +
          '    [TestFixture]\n' +
          '    public class ${className}\n' +
          '    {\n' +
          '        private IWebDriver driver;\n' +
          '        private StringBuilder verificationErrors = new StringBuilder();\n' +
          '        private string baseURL = "${baseURL}";\n' +
          "        private bool acceptNextAlert = true;\n" +
          '        \n' +
          '        [SetUp]\n' +
          '        public void SetupTest()\n' +
          '        {\n' +
          '            ${receiver} = new FirefoxDriver();\n' +
          '            baseURL = "${baseURL}";\n' +
          '            verificationErrors = new StringBuilder();\n' +
          '        }\n' +
          '        \n' +
          '        [TearDown]\n' +
          '        public void TeardownTest()\n' +
          '        {\n' +
          '            try\n' +
          '            {\n' +
          '                ${receiver}.Quit();\n' +
          '            }\n' +
          '            catch (Exception)\n' +
          '            {\n' +
          '                // Ignore errors if unable to close the browser\n' +
          '            }\n' +
		  '            if(verificationErrors.ToString().Length>0)\n'+
		  '                Assert.Fail(verificationErrors.ToString());\n'+
          '        }\n' +
          '        \n' +
          '        [Test]\n' +
          '        public void ${methodName}()\n' +
          '        {\n//COPY YOUR STUFF FROM HERE DON ;)\n' +
          '            var mainWindow=driver.CurrentWindowHandle;\n' +
		  '            var windows=driver.WindowHandles;\n'+
		  '            driver.Manage().Window.Position = new Point(0, 0);\n',
  footer:
          '        //ENDING HERE\n'+
		  '        }\n' +
          "        private bool IsElementPresent(By by)\n" +
          "        {\n" +
          "            try\n" +
          "            {\n" +
          "                driver.FindElement(by);\n" +
          "                return true;\n" +
          "            }\n" +
          "            catch (NoSuchElementException)\n" +
          "            {\n" +
          "                return false;\n" +
          "            }\n" +
          "        }\n" +
          '        \n' +
		  "        private void windowSwitch(string title)\n" +
          "        {\n" +
          "            var windows = driver.WindowHandles;\n"+
          "            foreach (var window in windows)\n" +
          "                if (driver.SwitchTo().Window(window).Title == title)\n"+
          "                    return;\n"+
		  "            Assert.Fail(\"Cannot find window: \"+title);\n"+
          "        }\n" +
          '        \n' +
          "        private bool IsAlertPresent()\n" +
          "        {\n" +
          "            try\n" +
          "            {\n" +
          "                driver.SwitchTo().Alert();\n" +
          "                return true;\n" +
          "            }\n" +
          "            catch (NoAlertPresentException)\n" +
          "            {\n" +
          "                return false;\n" +
          "            }\n" +
          "        }\n" +
          '        \n' +
		  '        private void waitForPopup(string title="null", int waitTime=30000)\n'+
          "        {\n" +
		  '             waitTime = waitTime / 1000;\n'+
		  '             if (title == "null" || title.Length == 0)\n'+
		  "             {\n"+
		  "                int windowNum = driver.WindowHandles.Count;\n"+
		  "                for (int second = 0; second < 30; second++){\n" +
		  "                    Thread.Sleep(1000);\n"+
		  '                    if (second >= 5) break;\n' +
		  "                    if (driver.WindowHandles.Count > 1) break;//temporary\n" +
		  '                }\n'+
		  '                if (driver.WindowHandles.Count == 1)\n'+
		  '                    Assert.Fail("timeout waiting for popup");\n'+
		  "             }\n"+
		  "             else\n"+
		  "             {\n"+
		  "                for (int second = 0; second < waitTime; second++)\n"+
		  "                   {\n"+
		  '                      if (second >= waitTime) Assert.Fail("timeout waiting for popup");\n'+
		  "                      var windows = driver.WindowHandles;\n"+
		  "                      foreach (var window in windows)\n"+
		  "                         if (driver.SwitchTo().Window(window).Title == title)\n"+
		  "                             return;\n"+
		  "                      Thread.Sleep(1000);\n"+
		  "                   }\n"+
		  "             }\n"+
		  "        }\n"+
          '        \n' +
          "        private string CloseAlertAndGetItsText() {\n" +
          "            try {\n" +
          "                IAlert alert = driver.SwitchTo().Alert();\n" +
		  "                var alertText = alert.Text;\n"+
          "                if (acceptNextAlert) {\n" +
          "                    alert.Accept();\n" +
          "                } else {\n" +
          "                    alert.Dismiss();\n" +
          "                }\n" +
          "                return alertText;\n" +
          "            } finally {\n" +
          "                acceptNextAlert = true;\n" +
          "            }\n" +
          "        }\n" +
          '    }\n' +
          '}\n',
  defaultExtension: "cs"
};
this.configForm = '<description>Variable for Selenium instance</description>' +
    '<textbox id="options_receiver" />' +
    '<description>Namespace</description>' +
    '<textbox id="options_namespace" />' +
    '<checkbox id="options_showSelenese" label="Show Selenese"/>';

this.name = "C# (WebDriver)";
this.testcaseExtension = ".cs";
this.suiteExtension = ".cs";
this.webdriver = true;

WDAPI.Driver = function() {
  this.ref = options.receiver;
};

WDAPI.Driver.searchContext = function(locatorType, locator) {
  var locatorString = xlateArgument(locator);
  switch (locatorType) {
    case 'xpath':
      return 'By.XPath(' + locatorString + ')';
    case 'css':
      return 'By.CssSelector(' + locatorString + ')';
    case 'id':
      return 'By.Id(' + locatorString + ')';
    case 'link':
      return 'By.LinkText(' + locatorString + ')';
    case 'name':
      return 'By.Name(' + locatorString + ')';
    case 'tag_name':
      return 'By.TagName(' + locatorString + ')';
  }
  throw 'Error: unknown strategy [' + locatorType + '] for locator [' + locator + ']';
};

WDAPI.Driver.prototype.back = function() {
  return this.ref + ".Navigate().Back()";
};

WDAPI.Driver.prototype.close = function() {
  return this.ref + ".Close()";
};

WDAPI.Driver.prototype.findElement = function(locatorType, locator) {
  return new WDAPI.Element(this.ref + ".FindElement(" + WDAPI.Driver.searchContext(locatorType, locator) + ")");
};

WDAPI.Driver.prototype.findElements = function(locatorType, locator) {
  return new WDAPI.ElementList(this.ref + ".FindElements(" + WDAPI.Driver.searchContext(locatorType, locator) + ")");
};

WDAPI.Driver.prototype.getCurrentUrl = function() {
  return this.ref + ".Url";
};

WDAPI.Driver.prototype.get = function(url) {
  if (url.length > 1 && (url.substring(1,8) == "http://" || url.substring(1,9) == "https://")) { // url is quoted
    return this.ref + ".Navigate().GoToUrl(" + url + ")";
  } else {
    return this.ref + ".Navigate().GoToUrl(baseURL + " + url + ")";
  }
};

WDAPI.Driver.prototype.getTitle = function() {
  return this.ref + ".Title";
};

WDAPI.Driver.prototype.getAlert = function() {
  return "CloseAlertAndGetItsText()";
};

WDAPI.Driver.prototype.chooseOkOnNextConfirmation = function() {
  return "acceptNextAlert = true";
};

WDAPI.Driver.prototype.chooseCancelOnNextConfirmation = function() {
  return "acceptNextAlert = false";
};

WDAPI.Driver.prototype.refresh = function() {
  return this.ref + ".Navigate().Refresh()";
};

WDAPI.Element = function(ref) {
  this.ref = ref;
};

WDAPI.Element.prototype.clear = function() {
  return this.ref + ".Clear()";
};

WDAPI.Element.prototype.click = function() {
  return this.ref + ".Click()";
};

//************************************************************
//Phase 1/18/2013 - added contextClick WDAPI function in the form of .contextClick(<reference>).perform()
WDAPI.Element.prototype.contextMenu = function() {
  return "new Actions(driver).ContextClick("+this.ref+").Perform()";
};

WDAPI.Driver.prototype.switchWindow = function(name) {
  if(name=="null")
	  return this.ref + ".SwitchTo().Window(mainWindow)";
  if(name=="last")
	  return "windows=driver.WindowHandles;\n"+this.ref + ".SwitchTo().Window(windows[windows.Count-1])";
  return "windowSwitch("+xlateArgument(name.split("=")[1])+")";
};

WDAPI.Driver.prototype.selectPopup = function(name) {
  if(name=="null")
	  return this.ref + ".SwitchTo().Window(driver.WindowHandles[driver.WindowHandles.Count-1])";
  if(name=="")
	  return this.ref + ".SwitchTo().Window(driver.WindowHandles[driver.WindowHandles.Count-1])";
  return "windowSwitch("+xlateArgument(name.split("=")[1])+")";
};

WDAPI.Driver.prototype.switchFrame = function(name) {
  if(name.split("=")[0]=="index")
		return "driver.SwitchTo().Frame("+name.split("=")[1]+")";
  return this.ref + ".SwitchTo().Frame("+xlateArgument(name)+")";
};

WDAPI.Element.prototype.SelectedOption = function() {
  return new WDAPI.Element("new SelectElement("+this.ref + ").SelectedOption");
};

WDAPI.Element.prototype.location = function() {
  return this.ref+".Location";
};

WDAPI.Element.prototype.getElementPositionTop = function() {
  return this.ref+".Location.Y";
};

WDAPI.Element.prototype.MoveToElement = function() {
  return "new Actions(driver).MoveToElement("+this.ref+").Perform()";
};

//shouldn't need these anymore
WDAPI.Element.prototype.selectBy = function(label) {
	//currently just accespting "label"
  return "new SelectElement("+this.ref+").SelectByText("+xlateArgument(label)+")";
};
WDAPI.Element.prototype.deselectBy = function(label) {
  return "new SelectElement("+this.ref+").DeselectByText("+xlateArgument(label)+")";
};

//in webdriver this uses coordinates
WDAPI.Element.prototype.mouseDown = function() {
   return "new Actions(driver).ClickAndHold("+this.ref+").Perform()";
};

WDAPI.Element.prototype.mouseUp = function() {
   return "new Actions(driver).Release("+this.ref+").Perform()";
};


WDAPI.Element.prototype.dragAndDrop = function(Destination) {
  return "new Actions(driver).DragAndDrop("+this.ref+","+Destination.ref+").Perform()";
};

WDAPI.Element.prototype.isEditable = function() {
  return this.ref+".Enabled";
};

WDAPI.Element.prototype.doubleClick = function() {
  return "new Actions(driver).DoubleClick("+this.ref+").Perform()";
};

WDAPI.Element.prototype.keyPress = function(keyPressed) {
   if(keyPressed.indexOf("\\")!=-1)
   {
      keyPressed= keyPressed.substring(1,keyPressed.length);
      return this.ref+".SendKeys(\"\"+Convert.ToChar("+keyPressed+"))";
   }
  return this.ref+".SendKeys(\""+keyPressed+"\")";
};

WDAPI.Element.prototype.dragAndDropOffset = function(offSet) {
  return "new Actions(driver).DragAndDropToOffset("+this.ref+","+offSet[0]+","+offSet[1]+").Perform()";
};

//************************************************************

//*************attempt an override**************

//Phase 3/4/2013 - verifyExpression (probably not done right, but good enough for Nate)
this.SeleniumWebDriverAdaptor.prototype.getExpression = function() {
  return xlateArgument(this.rawArgs[0]);
};

//Phase 4/15/2013 - getSelectOptions
this.SeleniumWebDriverAdaptor.prototype.getSelectOptions = function() {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).getSelectOptions();
};

//Phase 2/5/2013 - keyPress
this.SeleniumWebDriverAdaptor.prototype.keyPress = function() {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).keyPress(this.rawArgs[1]);
};

//Phase 2/5/2013 - doubleClick
this.SeleniumWebDriverAdaptor.prototype.doubleClick = function() {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).doubleClick();
};

//Phase 2/7/2013 - isAlertPresent
this.SeleniumWebDriverAdaptor.prototype.isAlertPresent = function() {
 	return WDAPI.Utils.isAlertPresent();
};

//Phase 3/12/2013 - isConfirmationPresent
SeleniumWebDriverAdaptor.prototype.isConfirmationPresent = function() {
 	return WDAPI.Utils.isAlertPresent();
};

//Phase 2/4/2013 - isEditable
this.SeleniumWebDriverAdaptor.prototype.isEditable = function() {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).isEditable();
};

//Phase 2/20/2013 - dragAndDrop
SeleniumWebDriverAdaptor.prototype.dragAndDrop = function(elementLocator){
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).dragAndDropOffset(this.rawArgs[1].split(","));
};

//Phase 2/4/2013 - Drag & Drop to Object
SeleniumWebDriverAdaptor.prototype.dragAndDropToObject = function(elementLocator, text) {
  var locator = this._elementLocator(this.rawArgs[0]);
  var locator2 = this._elementLocator(this.rawArgs[1]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).dragAndDrop(driver.findElement(locator2.type, locator2.string));
};

//Phase 1/31/2013 - I've chosen to override this function becuase of the addDoc.aspx page where it cannot clear the field but still needs to send keys
SeleniumWebDriverAdaptor.prototype.type = function(elementLocator, text) {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  var webElement = driver.findElement(locator.type, locator.string);
  return statement("try{"+new SeleniumWebDriverAdaptor.SimpleExpression(webElement.clear())) + "}catch(Exception){}\n" + webElement.sendKeys(this.rawArgs[1]);
};

//Phase 1/31/2013 - addSelection (selecting stuff in listboxes
this.SeleniumWebDriverAdaptor.prototype.addSelection = function() {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).select(this._selectLocator(this.rawArgs[1]));
};

//Phase 1/31/2013 - removeSelection (selecting stuff in listboxes
this.SeleniumWebDriverAdaptor.prototype.removeSelection = function() {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  //return driver.findElement(locator.type, locator.string).deselectBy(this.rawArgs[1].split("=")[1]);
  return driver.findElement(locator.type, locator.string).deselect(this._selectLocator(this.rawArgs[1]));
};

//Phase 2/1/2013 - mouseDown 
this.SeleniumWebDriverAdaptor.prototype.mouseDown = function() {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).mouseDown();
};

this.SeleniumWebDriverAdaptor.prototype.mouseUp = function() {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).mouseUp();
};

//Phase 1/18/2013 - switchWindow
this.SeleniumWebDriverAdaptor.prototype.selectWindow = function() {
  var driver = new WDAPI.Driver();
  return driver.switchWindow(this.rawArgs[0]);
};

//Phase 1/31/2013 - selectPopUp
this.SeleniumWebDriverAdaptor.prototype.selectPopUp = function() {
  var driver = new WDAPI.Driver();
  return driver.selectPopup(this.rawArgs[0]);
};

//Phase 1/29/2013 - switchFrame
this.SeleniumWebDriverAdaptor.prototype.selectFrame = function() {
  var driver = new WDAPI.Driver();
  return driver.switchFrame(this.rawArgs[0]);
};

//Phase 1/30/2013 - mouseOver
this.SeleniumWebDriverAdaptor.prototype.mouseOver = function() {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).MoveToElement();
};

//Phase 1/29/2013 - 
this.SeleniumWebDriverAdaptor.prototype.getElementPositionTop = function() {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).getElementPositionTop();
};

//Phase 1/18/2013 - added contextMenu in the form new Actions(driver).<element>.contextClick()
this.SeleniumWebDriverAdaptor.prototype.contextMenu = function() {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).contextMenu();
};

//Phase 1/24/2013 - add getEval method to store javascript stuff, hopefully this works....
this.SeleniumWebDriverAdaptor.prototype.getEval = function() {
   return WDAPI.Utils.getEval(this.rawArgs[0]);
   //return "(String)((IJavaScriptExecutor)driver).ExecuteScript("+xlateArgument(javaScriptFix(this.rawArgs[0]))+")";
};

//Phase 2/6/2013 - Simply adds a return to javascript statements
function javaScriptFix(sentence){
	if(sentence.indexOf("return")!=-1)
		return sentence;
	var withoutSemi;
	if(sentence.trim()[sentence.length-1]==";")
		withoutSemi = sentence.trim().substring(0,sentence.length-1);
	else
		withoutSemi = sentence.trim();
	var splitz = withoutSemi.split(';');
	splitz[splitz.length-1]= "return ("+splitz[splitz.length-1]+'+"")';
	return splitz.join(';')+';';
};

//Phase 1/29/2013 maybe just used for dropdown?
this.SeleniumWebDriverAdaptor.prototype.getSelectedValue = function() {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
   return driver.findElement(locator.type, locator.string).SelectedOption().getAttribute("value");
};

//Phase 2/4/2013 maybe just used for dropdown?
this.SeleniumWebDriverAdaptor.prototype.getSelectedLabel = function() {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
   return driver.findElement(locator.type, locator.string).SelectedOption().getText();
};

//Phase 1/24/2013 - Just adding a pause instead of wait for popup...
this.SeleniumWebDriverAdaptor.prototype.waitForPopUp = function() {
alert('test');
   return WDAPI.Utils.waitForPopup(this.rawArgs);
};

//Phase 1/28/2013 - Wait for next element?
this.SeleniumWebDriverAdaptor.prototype.waitForPageToLoad = function() {
   return "Thread.Sleep(3000)";
};

//Phase 5/20/2013 - selectLocator is undefined
this.SeleniumWebDriverAdaptor.prototype.select = function(elementLocator, label) {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).select(this._selectLocator(this.rawArgs[1]));
};

this.postFilter = function(originalCommands) {
  var commands = [];
  var commandsToSkip = {
    //'waitForPageToLoad' : 1,
    //'pause': 1
  };
  var rc;
  for (var i = 0; i < originalCommands.length; i++) {
    var c = originalCommands[i];
    if (c.type == 'command') {
      if (commandsToSkip[c.command] && commandsToSkip[c.command] == 1) {
        //Skip
      } else if (rc = SeleneseMapper.remap(c)) {  //Yes, this IS an assignment
        //Remap
        commands.push.apply(commands, rc);
      } else {
        commands.push(c);
      }
    } else {
      commands.push(c);
    }
  }
  return commands;
};


CallSelenium.prototype.toString = function() {
  log.info('Processing ' + this.message);
  //if (this.message == 'waitForPageToLoad') {
  //  return '';
  //}
  var result = '';
  var adaptor = new SeleniumWebDriverAdaptor(this.rawArgs);
  if (adaptor[this.message]) {
    var codeBlock = adaptor[this.message].call(adaptor);
    if (adaptor.negative) {
      this.negative = !this.negative;
    }
    if (this.negative) {
      result += notOperator();
    }
    result += codeBlock;
  } else {
    //unsupported
	alert(this.message+" unsupported, contact Phase");
    throw 'ERROR: Unsupported commandz [' + this.message + ' | ' + (this.rawArgs.length > 0 && this.rawArgs[0] ? this.rawArgs[0] : '') + ' | ' + (this.rawArgs.length > 1 && this.rawArgs[1] ? this.rawArgs[1] : '') + ']';
  }
  return result;
};


//this.remoteControl=true;
//************************************************************

WDAPI.Element.prototype.getAttribute = function(attributeName) {
  return this.ref + ".GetAttribute(" + xlateArgument(attributeName) + ")";
};

WDAPI.Element.prototype.getText = function() {
  return this.ref + ".Text";
};

WDAPI.Element.prototype.isDisplayed = function() {
  return this.ref + ".Displayed";
};

WDAPI.Element.prototype.isSelected = function() {
  return this.ref + ".Selected";
};

WDAPI.Element.prototype.sendKeys = function(text) {
  return this.ref + ".SendKeys(" + xlateArgument(text) + ")";
};

WDAPI.Element.prototype.submit = function() {
  return this.ref + ".Submit()";
};

WDAPI.Element.prototype.select = function(selectLocator) {
	//return "new SelectElement("+this.ref+").SelectByText("+xlateArgument(label.string,label.type)+")";
  if (selectLocator.type == 'index') {
    return "new SelectElement(" + this.ref + ").SelectByIndex(" + selectLocator.string + ")";
  }
  if (selectLocator.type == 'value') {
    return "new SelectElement(" + this.ref + ").SelectByValue(" + xlateArgument(selectLocator.string) + ")";
  }
  return "new SelectElement(" + this.ref + ").SelectByText(" + xlateArgument(selectLocator.string) + ")";
};

WDAPI.Element.prototype.deselect = function(selectLocator) {
	//return "new SelectElement("+this.ref+").SelectByText("+xlateArgument(label.string,label.type)+")";
  if (selectLocator.type == 'index') {
    return "new SelectElement(" + this.ref + ").DeselectByIndex(" + selectLocator.string + ")";
  }
  if (selectLocator.type == 'value') {
    return "new SelectElement(" + this.ref + ").DeselectByValue(" + xlateArgument(selectLocator.string) + ")";
  }
  return "new SelectElement(" + this.ref + ").DeselectByText(" + xlateArgument(selectLocator.string) + ")";
};

WDAPI.ElementList = function(ref) {
  this.ref = ref;
};

WDAPI.ElementList.prototype.getItem = function(index) {
  return this.ref + "[" + index + "]";
};

WDAPI.ElementList.prototype.getSize = function() {
  return this.ref + ".Count";
};

WDAPI.ElementList.prototype.isEmpty = function() {
  return this.ref + ".Count == 0";
};

WDAPI.Utils = function() {
};

WDAPI.Utils.isElementPresent = function(how, what) {
  return "IsElementPresent(" + WDAPI.Driver.searchContext(how, what) + ")";
};

WDAPI.Utils.isAlertPresent = function() {
  return "IsAlertPresent()";
};

WDAPI.Utils.waitForPopup = function() {
    return 'waitForPopup("null")';
};

WDAPI.Utils.getEval = function(evalu) {
   return "(String)((IJavaScriptExecutor)driver).ExecuteScript("+xlateArgument(javaScriptFix(evalu))+")";
};
