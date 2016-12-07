/**
 * Register the vue-recent-posts component.
 */
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


/**
 * Setup an individual widget with a Vue instance.
 * @param item
 */
function setupWidget( item ) {
	var widgetID = item.getAttribute( 'id' );
	var element = item.querySelector( '.vue-widget' );
	var postCount = element.getAttribute( 'data-number' ) || 5;
	var showDate = element.getAttribute( 'data-show-date' ) || false;

	/**
	 * To avoid not showing any content each subsequent load,
	 * we will be saving the posts in localStorage and getting it here.
	 * @type {Array}
	 */
	var initialPosts = JSON.parse( localStorage.getItem( widgetID ) ) || [];

	new Vue( {
		el: element,
		data: {
			posts: initialPosts,
			showDate: showDate
		},
		template: '<vue-recent-posts :posts="posts" :show-date="showDate"></vue-recent-posts>',
		created: function() {

			/**
			 * Once the Vue instance is created we're going to fetch the latest posts via
			 * WP REST content API endpoints.
			 * @type {XMLHttpRequest}
			 */
			var request = new XMLHttpRequest();

			request.open( 'GET', '/wp-json/wp/v2/posts?per_page=' + parseInt( postCount ) + '&order=desc', true );

			/**
			 * We need to hold a copy of the Vue as the callback will change scope.
			 * @type {created}
			 */
			var vm = this;

			/**
			 * Note, this will happen for every instance of the widget.
			 * This is because each Widget may have its own parameters.
			 */
			request.onload = function() {
				if ( request.status >= 200 && request.status < 400 ) {
					var resp = request.responseText;

					/**
					 * Update the component's posts so that Vue can work its magic.
					 */
					vm.posts = JSON.parse( resp );

					/**
					 * Update local storage for better UX.
					 */
					localStorage.setItem( widgetID, resp );
				}
			}
			request.send();
		}
	} );
}

/**
 * Vanilla version of $(document).ready()
 * @param fn
 */
function ready(fn) {
	if (document.readyState != 'loading'){
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

/**
 * Once the doc is ready, lets roll.
 */
ready(function(){

	/**
	 * Grab all the Vue Recent Posts widgets.
	 * @type {NodeList}
	 */
	var widgets = document.querySelectorAll( '.widget_vue_recent_posts_widget' );

	/**
	 * Setup all the widgets with Vue instances
	 */
	widgets.forEach( function( item ) {
		setupWidget( item );
	} );


	/**
	 * Play nice with Customizer selective refresh.
	 */
	if ( 'undefined' === typeof wp || ! wp.customize || ! wp.customize.selectiveRefresh ) {
		return;
	}

	/**
	 * Re-init the widget upon partial refresh.
	 */
	wp.customize.selectiveRefresh.bind( 'partial-content-rendered', function( placement ) {
		if ( placement.container ) {
			setupWidget( placement.container[0] );
		}
	} );
});