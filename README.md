# Manually implementing MVC design pattern in JavaScript.

In this repository I've built a web application on top of an application-level structure using the MVC design pattern.

The Model-View-Controller is such a great web-based architectural design pattern. It helps a great deal to separate your application logic from the User Interface.

## Advantages:
- + your code would be more modulare.
- + it's less painfull to debug.

## Usage

const
	model = Model.setup({
		author: 'Adel',
		title: 23,
		url: 'https://adelsblogs.com'
	}).save(); // sends a POST/PUT Ajax request.
	view = View.setup().suscribe( model );

Every time the model changes, the views subscribing that model get updated.
