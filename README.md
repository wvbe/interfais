# INTERFAIS

![Screenshot in the face](./screenshot.gif)

__What it do?__ It provides you with an API to generate a terminal app with different views in different cells, different "routes" to get to a combination of those views and different UI elements to populate those views with.

__How it does?__ It gives you an appFactory, viewFactory and some helper functions to make it easy for you to generate UI with the results of your own application's logic. Check out the `./example` directory, or run `npm start` for a working examle application.

# Views and the UI
The application takes Views and renders them in a configured arrangement, a View is basically just a bunch of callbacks that dictate what happens when a view is loaded, closed, focused, etc. This is also where the UI gets constructed.

The UI is defined using the uiFactory, and goes consists of a bunch of (chainable) functions that queues your content for render-time. These UI functions give you basic formatting, styles and interactivity for stuff like headers, paragraphs, menu options etc, taking position, size, padding and margin of a cell into account.

To create your own view:

```
var interfais = require('interfais');
module.exports = interfais.viewFactory(function(ui) {
    var lastBurger = new Date().getTime();
    ui
        .background('blue')
        
        .foreground('white')
        
        // Two rows and one column offset between cell edge and UI bg
        .margin(2, 1)
        
        // One row and two columns offset between UI bg and ASCII content/foreground
        .padding(1, 2)
        
        // Uppercased and underlined
        .h1('Page header, its pretty prominent')
        
        // Wrapping text
        .paragraph('Paragraph text, or a bunch of paragraphs. Text in this style wraps to the edges of the cell nicely. The following line renders a ruler of dash characters:')
        
        // Character repeat across view width
        .ruler('-')
        
        // Non-wrapping line
        .line('A line does not wrap')
        
        // Empty line
        .spacer()
        
        // Underlined
        .h2('Moar advanced')
        
        // Adds one selectable menu item
        .option('Hit [ENTER] to select me', function() {
            // Run when option item is selected
            
            // Example:
            interfais.routeManager.openRoute('special-page');
        })
        
        // Force view rerender every x milliseconds
        .interval(1000)
        
        // UI with dynamic content
        .line(function() {
            // Rerun at each render, so always up to date, great place to do a lookup
            // in one of your services
            
            // Always returns an *array* of arguments which would be passed to the
            // actual method, line() in this case. Example:
            var secondsSinceBurger = (new Date().getTime() - lastBurger)/1000;
            return ['I ate my last burger ' + secondsSinceBurger + ' seconds ago'];
        });
});

```

Use the exported view in your configuration, either in a cell configuration, a route configuration or both.


```
# Clone and run example:
git clone git@github.com:wvbe/interfais.git
cd interfais
npm install
npm start

# Use in project
npm install git+https://git@github.com/wvbe/interfais.git#master --save
```