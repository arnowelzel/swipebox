Swipebox
================================

A touchable jQuery lightbox.

[Original project page](http://brutaldesign.github.com/swipebox)

[Fork by Arno Welzel](https://github.com/arnowelzel/swipebox)

##What is Swipebox ?

Swipebox is a jQuery "lightbox" plugin for desktop, mobile and tablet.

##Features

- Swipe gestures for mobile
- Keyboard Navigation for desktop
- CSS transitions with jQuery fallback
- Retina support for UI icons
- Easy CSS customization

###Additional stuff in this fork

- If there is no "title" attribute in the image link the plugin will try to use the "alt" attribute
  of the image inside the link element
- Clicking on the picture will show and hide the navigation/title bar in desktop browsers
- Bound touch event to the slider and not to the body, so click events can still be used for other elements
- Modified handler for navigation buttons to use click events instead of touch events to avoid problems
  with some mobile browsers (e.g. "endless swiping" on stock Android browser or Chrome or re-opening the
  box when closing the lightbox using the "x" button and underneath is a clickable image)

###Compatibility

Chrome, Safari, Firefox, Opera, IE8+, IOS4+, Android, windows phone.

##Usage

###Javascript

Include jquery and the swipebox script in your head tags or right before your body closing tag.

```html
<script src="lib/jquery-1.9.0.js"></script>
<script src="source/jquery.swipebox.js"></script>
```

###CSS

Include the swipebox CSS style in your head tags.

```html
<link rel="stylesheet" href="source/swipebox.css">
```

###HTML

Use a specific class for your links and use the title attribute as caption.

```html
<a href="big/image.jpg" class="swipebox" title="My Caption">
```

###Fire the plugin

Bind the swipebox behaviour on every link with the "swipebox" class.

```javascript
$(".swipebox").swipebox();
```

###Options

```javascript
useCSS : true, // false will force the use of jQuery for animations
initialIndexOnArray: 0, // which image index to init when a array is passed
hideBarsDelay : 3000, // 0 to always show caption and action bar
videoMaxWidth : 1140, // videos max width
beforeOpen: function(){} , // called before opening
afterClose: function(){} // called after closing
```

####Credits

Original code by [Constantin Saguin](https://github.com/brutaldesign)

Photos by [Daniele Zedda](http://www.flickr.com/photos/astragony/)
