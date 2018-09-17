//Episodes accordion animation
$(document).ready( () => {
	$('.ui.accordion').accordion();
});

//Mobile sidebar menu animation
$(document).ready( () => {
      $('.main.menu').visibility({
      	type: 'fixed'
      });

      $('.ui.sidebar')
        .sidebar('attach events', '.toc.item')
      ;
});	    

