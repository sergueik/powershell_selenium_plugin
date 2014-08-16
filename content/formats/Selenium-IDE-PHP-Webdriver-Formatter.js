/**
  To use, download the JS file, and in the Selenium IDE click Options->Options. Go into Formats, click "Add". 
  Paste in the contents of the JS file.
*/

/*
 * Formatter for Selenium 2 / WebDriver PHP client.
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
  return "test_" + testName.split(/[^0-9A-Za-z]+/).map(
      function(x) {
        return underscore(x);
      }).join('');
  //return "test_" + underscore(testName);
}

function nonBreakingSpace() {
  return "u\"\\u00a0\"";
}

function string(value) {
  value = value.replace(/\\/g, '\\\\');
  value = value.replace(/\"/g, '\\"');
  value = value.replace(/\r/g, '\\r');
  value = value.replace(/\n/g, '\\n');
  var unicode = false;
  for (var i = 0; i < value.length; i++) {
    if (value.charCodeAt(i) >= 128) {
      unicode = true;
    }
  }
  return (unicode ? 'u' : '') + '"' + value + '"';
}

function array(value) {
  var str = 'Array(';
  for (var i = 0; i < value.length; i++) {
    str += string(value[i]);
    if (i < value.length - 1) str += ", ";
  }
  str += ')';
  return str;
}

notOperator = function() {
  return "! ";
};

Equals.prototype.toString = function() {
  return this.e1.toString() + " == " + this.e2.toString();
};

Equals.prototype.assert = function() {
  return "$this->assertEqual(" + this.e1.toString() + ", " + this.e2.toString() + ")";
};

Equals.prototype.verify = function() {
  return verify(this.assert());
};

NotEquals.prototype.toString = function() {
  return this.e1.toString() + " != " + this.e2.toString();
};

NotEquals.prototype.assert = function() {
  return "$this->assertNotEqual(" + this.e1.toString() + ", " + this.e2.toString() + ")";
};

NotEquals.prototype.verify = function() {
  return verify(this.assert());
};

function joinExpression(expression) {
  return "','.join(" + expression.toString() + ")";
}

function statement(expression) {
  return expression.toString();
}

function assignToVariable(type, variable, expression) {
  return variable + " = " + expression.toString();
}

function ifCondition(expression, callback) {
  var blk = callback().replace(/\n$/m,'');
  return "if " + expression.toString() + "{\n" + blk;
}

function assertTrue(expression) {
  return "$this->assertTrue(" + expression.toString() + ");";
}

function assertFalse(expression) {
  return "$this->assertFalse(" + expression.toString() + ");";
}

function verify(statement) {
  return   "try {\n" +
  			"	" + statement + "\n" +
    	  	'} catch (PHPUnit_Framework_AssertionFailedError $e) {\n' +
		  	'	$this->verificationErrors[] = $e->toString();\n' + 
		  '}\n';
}

function verifyTrue(expression) {
  return verify(assertTrue(expression));
}

function verifyFalse(expression) {
  return verify(assertFalse(expression));
}

RegexpMatch.patternAsRawString = function(pattern) {
  var str = pattern;
  if (str.match(/\"/) || str.match(/\n/)) {
    str = str.replace(/\\/g, "\\\\");
    str = str.replace(/\"/g, '\\"');
    str = str.replace(/\n/g, '\\n');
    return '"' + str + '"';
  } else {
    return str = 'r"' + str + '"';
  }
};

RegexpMatch.prototype.patternAsRawString = function() {
  return RegexpMatch.patternAsRawString(this.pattern);
};

RegexpMatch.prototype.toString = function() {
  var str = this.pattern;
  if (str.match(/\"/) || str.match(/\n/)) {
    str = str.replace(/\\/g, "\\\\");
    str = str.replace(/\"/g, '\\"');
    str = str.replace(/\n/g, '\\n');
    return '"' + str + '"';
  } else {
    str = 'r"' + str + '"';
  }
  return "re.search(" + str + ", " + this.expression + ")";
};

RegexpMatch.prototype.assert = function() {
  return '$this->assertRegexpMatches(' + this.expression + ", " + this.patternAsRawString() + ")";
};

RegexpMatch.prototype.verify = function() {
  return verify(this.assert());
};

RegexpNotMatch.prototype.patternAsRawString = function() {
  return RegexpMatch.patternAsRawString(this.pattern);
};

RegexpNotMatch.prototype.assert = function() {
  return '$this->assertNotRegexpMatches(' + this.expression + ", " + this.patternAsRawString() + ")";
};

RegexpNotMatch.prototype.verify = function() {
  return verify(this.assert());
};

function waitFor(expression) {
  return "for ($i =0; $i < 60; $i++){\n" +
      indents(1) + "\n" +
      indents(2) + "if " + expression.toString() + "{ break;}\n" +
      indents(1) + 'sleep(1)\n' +
      '}';
}

function assertOrVerifyFailure(line, isAssert) {
  return "try{ " + line + "\n" +
      indent(2) + '		} catch (PHPUnit_Framework_AssertionFailedError $e) {\n' +
		  indent(3) + '			$this->verificationErrors[] = $e->toString();\n';
}

function pause(milliseconds) {
  return "usleep(" + (parseInt(milliseconds, 10) / 1000) + ")";
}

function echo(message) {
  return "print(" + xlateArgument(message) + ")";
}

function formatComment(comment) {
  return comment.comment.replace(/.+/mg, function(str) {
    return "// " + str;
  });
}

function defaultExtension() {
  return this.options.defaultExtension;
}

this.options = {
  receiver: "$this->session",
  showSelenese: 'false',
  rcHost: "localhost",
  rcPort: "4444",
  environment: "*chrome",
  header:
          '<?\n' +
          'require_once(\'PHPUnit/Autoload.php\');\n\n' +
          '/* This is a helper class. We assume youll run phpunit like phpunit ${className} ${className}.php*/' +
          'class PHPUnit_Framework_TestCase_webdriver extends PHPUnit_Framework_TestCase{\n' + 
			'    public function testElementsExist($how,$what) {\n' +
			'        if (!isset($this->session)){\n' +
			'            return false;\n' +
			'        }\n' +
			'        $e = $this->session->elements($how, $what);\n' +
			'        try {\n' +
			'           $this->assertGreaterThan(0,count($e));\n' +
			'        } catch (PHPUnit_Framework_AssertionFailedError $e) {\n' +
			'            $this->verificationErrors[] = $e->toString();\n' +
			'       }\n' +
			'    }\n' +
			'\n' +
			'    public function close_alert_and_get_its_text(){\n' +
			'        if (!isset($this->session)){\n' +
			'            return false;\n' +
			'        }\n' +
			'        try {\n' +
			'            $a = $this->session->switch_to_alert();\n' +
			'            $a->accept();\n' +
			'            return $a->text;\n' +
			'        } catch (PHPUnit_Framework_AssertionFailedError $e) {\n' +
			'            $this->verificationErrors[] = $e->toString();\n' +
			'        }\n' +
			'    }\n' +
			'}\n\n\n\n/*Actual class that gets run for testing. Test with phpunit ${className} ${className}.php\n@WG_STA_CL\n*/\n' +
          'class ${className} extends PHPUnit_Framework_TestCase {\n' +
          indent(1) + '	protected static $driver;\n' +
          indent(1) + '	protected function setUp(){\n' +
          indent(2) + '		self::$driver = new PHPWebDriver_WebDriver();\n' +
          indent(2) + '		$this->session = self::$driver->session();\n' +
          indent(2) + '		$this->base_url = "${baseURL}";\n' +
          indent(1) + '	}\n' +
          indent(1) + '	protected function tearDown(){\n' +
          indent(2) + '		$this->session->close();\n' +
          indent(1) + '	}\n' +
          indent(1) + '	protected function runTest(){\n',
  footer:
      '	}    \n' +

          '}\n/*\n@WG_END_CL*/\n' +
          '?>',
  indent:  '4',
  initialIndents: '2',
  defaultExtension: "php"
};

this.configForm =
    '<description>Variable for Selenium instance</description>' +
        '<textbox id="options_receiver" />' +
        '<description>Selenium RC host</description>' +
        '<textbox id="options_rcHost" />' +
        '<description>Selenium RC port</description>' +
        '<textbox id="options_rcPort" />' +
        '<description>Environment</description>' +
        '<textbox id="options_environment" />' +
        '<description>Header</description>' +
        '<textbox id="options_header" multiline="true" flex="1" rows="4"/>' +
        '<description>Footer</description>' +
        '<textbox id="options_footer" multiline="true" flex="1" rows="4"/>' +
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

this.name = "PHP (WebDriver)";
this.testcaseExtension = ".php";
this.suiteExtension = ".php";
this.webdriver = true;

WDAPI.Driver = function() {
  this.ref = options.receiver;
};

WDAPI.Driver.searchContext = function(locatorType, locator) {
  var locatorString = xlateArgument(locator);
  switch (locatorType) {
    case 'xpath':
      return 'PHPWebDriver_WebDriverBy::XPATH,' + locatorString;
    case 'css':
      return 'PHPWebDriver_WebDriverBy::CSS_SELECTOR,' + locatorString;
    case 'id':
      return 'PHPWebDriver_WebDriverBy::ID,' + locatorString;
    case 'link':
      return 'PHPWebDriver_WebDriverBy::LINK_TEXT,' + locatorString;
    case 'name':
      return 'PHPWebDriver_WebDriverBy::NAME,' + locatorString;
    case 'tag_name':
      return 'PHPWebDriver_WebDriverBy::TAG_NAME,' + locatorString;
  }
  throw 'Error: unknown strategy [' + locatorType + '] for locator [' + locator + ']';
};

WDAPI.Driver.searchContextArgs = function(locatorType, locator) {
  var locatorString = xlateArgument(locator);
  switch (locatorType) {
    case 'xpath':
      return 'PHPWebDriver_WebDriverBy::XPATH,' + locatorString;
    case 'css':
      return 'PHPWebDriver_WebDriverBy::CSS_SELECTOR,' + locatorString;
    case 'id':
      return 'PHPWebDriver_WebDriverBy::ID,' + locatorString;
    case 'link':
      return 'PHPWebDriver_WebDriverBy::LINK_TEXT,' + locatorString;
    case 'name':
      return 'PHPWebDriver_WebDriverBy::NAME,' + locatorString;
    case 'tag_name':
      return 'PHPWebDriver_WebDriverBy::TAG_NAME,' + locatorString;
  }
  throw 'Error: unknown strategy [' + locatorType + '] for locator [' + locator + ']';
};

WDAPI.Driver.prototype.back = function() {
  return this.ref + "->back();";
};

WDAPI.Driver.prototype.close = function() {
  return this.ref + "->close();";
};

WDAPI.Driver.prototype.findElement = function(locatorType, locator) {
  return new WDAPI.Element(this.ref + "->element(" + WDAPI.Driver.searchContext(locatorType, locator) + ")");
};

WDAPI.Driver.prototype.findElements = function(locatorType, locator) {
  return new WDAPI.ElementList(this.ref + "->elements(" + WDAPI.Driver.searchContext(locatorType, locator) + ")");
};

WDAPI.Driver.prototype.getCurrentUrl = function() {
  return this.ref + "->url();";
};

WDAPI.Driver.prototype.get = function(url) {
  if (url.length > 1 && (url.substring(1,8) == "http://" || url.substring(1,9) == "https://")) { // url is quoted
    return this.ref + "->open(" + url + ");";
  } else {
    return this.ref + "->open($this->base_url . " + url + ");";
  }
};

WDAPI.Driver.prototype.getTitle = function() {
  return this.ref + "->title()";
};

WDAPI.Driver.prototype.getAlert = function() {
  return "$this->close_alert_and_get_its_text();";
};

WDAPI.Driver.prototype.chooseOkOnNextConfirmation = function() {
  return "$this->accept_next_alert = true;";
};

WDAPI.Driver.prototype.chooseCancelOnNextConfirmation = function() {
  return "$this->accept_next_alert = false;";
};

WDAPI.Driver.prototype.refresh = function() {
  return this.ref + "->refresh();";
};

WDAPI.Element = function(ref) {
  this.ref = ref;
};

WDAPI.Element.prototype.clear = function() {
  return this.ref + "->clear();";
};

WDAPI.Element.prototype.click = function() {
  return this.ref + "->click();";
};

WDAPI.Element.prototype.getAttribute = function(attributeName) {
  return this.ref + "->attribute(" + xlateArgument(attributeName) + ")";
};

WDAPI.Element.prototype.getText = function() {
  return this.ref + "->text();";
};

WDAPI.Element.prototype.isDisplayed = function() {
  return this.ref + "->displayed();";
};

WDAPI.Element.prototype.isSelected = function() {
  return this.ref + "->selected();";
};

WDAPI.Element.prototype.sendKeys = function(text) {
  return this.ref + "->sendKeys(" + xlateArgument(text) + ");";
};

WDAPI.Element.prototype.submit = function() {
  return this.ref + "->submit();";
};

WDAPI.Element.prototype.select = function(label) {
  return "Select(" + this.ref + ").select_by_visible_text(" + xlateArgument(label) + ")";
};

WDAPI.ElementList = function(ref) {
  this.ref = ref;
};

WDAPI.ElementList.prototype.getItem = function(index) {
  return this.ref + "[" + index + "]";
};

WDAPI.ElementList.prototype.getSize = function() {
  return 'count(' + this.ref + ")";
};

WDAPI.ElementList.prototype.isEmpty = function() {
  return 'count(' + this.ref + ") == 0";
};


WDAPI.Utils = function() {
};

WDAPI.Utils.isElementPresent = function(how, what) {
  return "$this->testElementsExist(" + WDAPI.Driver.searchContextArgs(how, what) + ")";
};
