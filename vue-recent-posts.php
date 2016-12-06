<?php
/*
Plugin Name: Vue Recent Posts Widget
Plugin URI: http://rheinardkorf.com
Description: A Vue driven Recent Posts Widget
Version: 0.1-alpha
Author: Rheinard Korf
Author URI: http://rheinardkorf.com
License: GPL2
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: vue_recent_posts
Domain Path: /languages
*/

// Creating the widget
class Vue_Recent_Posts_Widget extends WP_Widget {

	function __construct() {
		parent::__construct(
			// Base ID of your widget
			'Vue_Recent_Posts_Widget',

			// Widget name will appear in UI
			__( 'Vue Recent Posts', 'vue_recent_posts' ),

			// Widget options
			array(
				'description' => __( 'Vue driven recent posts.', 'vue_recent_posts' ),
				//'customize_selective_refresh' => true,
			)
		);
	}


	public function widget( $args, $instance ) {
		$title = apply_filters( 'widget_title', $instance['title'] );
		//// before and after widget arguments are defined by themes
		echo $args['before_widget'];
		echo $args['before_title'] . $title . $args['after_title'];
		echo '<div class="vue-widget" data-number="' . (int) $instance['number'] . '" data-show-date="' . $instance['show_date'] . '">';
		echo $args['after_widget'];
	}

	// Widget Backend
	public function form( $instance ) {
		$title     = isset( $instance['title'] ) ? esc_attr( $instance['title'] ) : '';
		$number    = isset( $instance['number'] ) ? absint( $instance['number'] ) : 5;
		$show_date = isset( $instance['show_date'] ) ? (bool) $instance['show_date'] : false;
		?>
		<p><label for="<?php echo $this->get_field_id( 'title' ); ?>"><?php _e( 'Title:' ); ?></label>
			<input class="widefat" id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" type="text" value="<?php echo $title; ?>" /></p>

		<p><label for="<?php echo $this->get_field_id( 'number' ); ?>"><?php _e( 'Number of posts to show:' ); ?></label>
			<input class="tiny-text" id="<?php echo $this->get_field_id( 'number' ); ?>" name="<?php echo $this->get_field_name( 'number' ); ?>" type="number" step="1" min="1" value="<?php echo $number; ?>" size="3" /></p>

		<p><input class="checkbox" type="checkbox"<?php checked( $show_date ); ?> id="<?php echo $this->get_field_id( 'show_date' ); ?>" name="<?php echo $this->get_field_name( 'show_date' ); ?>" />
			<label for="<?php echo $this->get_field_id( 'show_date' ); ?>"><?php _e( 'Display post date?' ); ?></label></p>
		<?php
	}

	public function update( $new_instance, $old_instance ) {
		$instance = $old_instance;
		$instance['title'] = sanitize_text_field( $new_instance['title'] );
		$instance['number'] = (int) $new_instance['number'];
		$instance['show_date'] = isset( $new_instance['show_date'] ) ? (bool) $new_instance['show_date'] : false;
		return $instance;
	}
} // Class Vue_Recent_Posts_Widget ends here

// Register and load the widget
function vue_recent_posts_load_widget() {
	register_widget( 'Vue_Recent_Posts_Widget' );
}

add_action( 'widgets_init', 'vue_recent_posts_load_widget' );

function vue_recent_posts_enqueue_script() {
	wp_enqueue_script( 'vuejs', plugins_url( '/js/vue.min.js', __FILE__ ), array(), false, false );
	wp_enqueue_script( 'vue_recent_posts', plugins_url( '/js/widget.js', __FILE__ ), array(), false, true );
}

add_action( 'wp_enqueue_scripts', 'vue_recent_posts_enqueue_script' );
