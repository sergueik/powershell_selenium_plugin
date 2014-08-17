for source in 'build.bat' 'build.sh' 'chrome.manifest' 'chrome.manifest.production' 'content/formats/format-loader.xul' 'install.rdf' ; do 
echo $source
sed -i 's/webdriver-backed-formatterss/webdriver-backed-formatters/g' $source
sed -i 's/webdriver-backed-formatters/powershell-webdriver-formatter/g' $source
sed -i 's/dave.hunt/serguei.kouzmine/g' $source

done

