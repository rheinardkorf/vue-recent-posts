function ready( fn ) {
	if ( document.readyState != 'loading' ) {
		fn();
	} else {
		document.addEventListener( 'DOMContentLoaded', fn );
	}
}

ready( function() {

	Vue.component( 'vue-recent-posts', {
		props: ['posts', 'showDate'],
		template: '<ul><li v-for="post in posts"><a :href="post.link">{{ post.title.rendered }}</a> ' +
				  '<span v-if="showDate" class="post-date">{{ formatDate(post.date) }}</span></li></ul>',
		methods: {
			formatDate: function( dateString ) {
				var date = new Date( dateString );
				return date.toDateString();
			}
		}
	} );

	var widgets = document.querySelectorAll( '.widget_vue_recent_posts_widget' );

	widgets.forEach( function( item, i ) {

		var widgetID = item.getAttribute( 'id' );
		var element = item.querySelector( '.vue-widget' );
		var postCount = element.getAttribute( 'data-number' ) || 5;
		var showDate = element.getAttribute( 'data-show-date' ) || false;

		// Try localstorage
		var initialPosts = JSON.parse( localStorage.getItem( widgetID ) ) || [];

		new Vue( {
			el: element,
			data: {
				posts: initialPosts,
				showDate: showDate
			},
			template: '<vue-recent-posts :posts="posts" :show-date="showDate"></vue-recent-posts>',
			created: function() {
				var request = new XMLHttpRequest();
				request.open( 'GET', '/wp-json/wp/v2/posts?per_page=' + parseInt( postCount ) + '&order=desc', true );

				var vm = this;
				request.onload = function() {
					if ( request.status >= 200 && request.status < 400 ) {
						var resp = request.responseText;
						vm.posts = JSON.parse( resp );
						// Also update localStorage
						localStorage.setItem( widgetID, resp );
					}
				}
				request.send();
			}
		} );
	} );
} );