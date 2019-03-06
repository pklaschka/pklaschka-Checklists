<img alt="logo" height="48" src="https://github.com/pklaschka/pklaschka-checklists/blob/master/assets/icon.png?raw=true" />

# pklaschka Checklists

**:warning: This is still WIP. I already use it in production, but there may be many bugs or unimplemented features with buttons leading nowhere, so use it with caution :wink:**

A small checklist app, written in electron, making manual software testing before releases easy (and documentable, by generating reports with screenshots of the testing process)

![screenshot](https://github.com/pklaschka/pklaschka-checklists/blob/master/assets/screenshot-01.jpg?raw=true)

## Features:
- Entering Metadata regarding the test (e.g., tested version, date and tester) freely defineable in the checklist's defining XML file
- Easy to understand XML Schema for defining checklists
- Ability to make screenshots at certain points during the checklist for documentation purposes (by simply using `<screenshot />` in the checklist file)
- Saving Reports (HTML) with screenshots, Metadata etc. to clearly document testing of your software to release with confidence

## Checklist files (`.xml` or `.checklist`)
The files defining checklists are written in XML and only allow for a few elements (clearly defined in an XSD schema) making creating them quick and easy to understand.

A technical documentation on these XML files can get found at https://github.com/pklaschka/pklaschka-checklists/blob/master/assets/checklist_schema_docs.pdf. However, you should be able to understand how checklist files work much quicker by just taking a look at the example below:

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<checklist 
    xsi:schemaLocation="https://xdplugins.pabloklaschka.de https://xdplugins.pabloklaschka.de/xsd/checklist.xsd" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    xmlns="https://xdplugins.pabloklaschka.de" 
    version="0.1.0" name="Markdown for Adobe XD Manual Checks Checklist">
    <meta>
        <date>Date of testing</date>
        <text>Tester</text>
        <text>Tested version</text>
    </meta>
    <item>Open a new window</item>
    <item>Make some changes</item>
    <screenshot/>
    <item>Open dialog XYZ</item>
    <group title="Dialog XYZ">
        <screenshot/>
        <item>Check A</item>
        <item>Check B</item>
        <item>Close the dialog</item>
    </group>
    <item>One last thing</item>
    <screenshot/>
</checklist>
```

Please note that the order of the items in your XML defines the chronological order in which they get asked in the checklist.