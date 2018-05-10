<?php
/**
 * WP_Block_Type_Registry Tests
 *
 * @package Gutenberg
 */

/**
 * Tests for WP_Block_Type_Registry
 */
class Gutenberg_REST_API_Test extends WP_UnitTestCase {
	function setUp() {
		parent::setUp();

		$this->administrator = $this->factory->user->create( array(
			'role' => 'administrator',
		) );
		$this->author        = $this->factory->user->create( array(
			'role' => 'author',
		) );
		$this->editor        = $this->factory->user->create( array(
			'role' => 'editor',
		) );
		$this->contributor   = $this->factory->user->create( array(
			'role' => 'contributor',
		) );
		$this->subscriber    = $this->factory->user->create(
			array(
				'role'         => 'subscriber',
				'display_name' => 'subscriber',
				'user_email'   => 'subscriber@example.com',
			)
		);
	}

	function tearDown() {
		parent::tearDown();
	}

	/**
	 * Should return an extra visibility field on response when in edit context.
	 */
	function test_visibility_field() {
		wp_set_current_user( $this->administrator );

		$request = new WP_REST_Request( 'GET', '/wp/v2/taxonomies/category' );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );

		$result = $response->get_data();

		$this->assertTrue( isset( $result['visibility'] ) );
		$this->assertInternalType( 'array', $result['visibility'] );
		$this->assertArrayHasKey( 'public', $result['visibility'] );
		$this->assertArrayHasKey( 'publicly_queryable', $result['visibility'] );
		$this->assertArrayHasKey( 'show_ui', $result['visibility'] );
		$this->assertArrayHasKey( 'show_admin_column', $result['visibility'] );
		$this->assertArrayHasKey( 'show_in_nav_menus', $result['visibility'] );
		$this->assertArrayHasKey( 'show_in_quick_edit', $result['visibility'] );
	}

	/**
	 * Should return an extra visibility field on response.
	 */
	function test_visibility_field_for_non_admin_roles() {
		wp_set_current_user( $this->editor );

		$request = new WP_REST_Request( 'GET', '/wp/v2/taxonomies/category' );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );

		$result = $response->get_data();

		$this->assertTrue( isset( $result['visibility'] ) );
		$this->assertInternalType( 'array', $result['visibility'] );
		$this->assertArrayHasKey( 'public', $result['visibility'] );
		$this->assertArrayHasKey( 'publicly_queryable', $result['visibility'] );
		$this->assertArrayHasKey( 'show_ui', $result['visibility'] );
		$this->assertArrayHasKey( 'show_admin_column', $result['visibility'] );
		$this->assertArrayHasKey( 'show_in_nav_menus', $result['visibility'] );
		$this->assertArrayHasKey( 'show_in_quick_edit', $result['visibility'] );

		/**
		 * See https://github.com/WordPress/gutenberg/issues/2545
		 *
		 * Until that is resolved authors will not be able to set taxonomies.
		 * This should definitely be resolved though.
		 */
		wp_set_current_user( $this->author );

		$response = rest_do_request( $request );

		$result = $response->get_data();

		$this->assertFalse( isset( $result['visibility'] ) );
	}

	/**
	 * Should not return an extra visibility field without context set.
	 */
	function test_visibility_field_without_context() {
		$request  = new WP_REST_Request( 'GET', '/wp/v2/taxonomies/category' );
		$response = rest_do_request( $request );

		$result = $response->get_data();

		$this->assertFalse( isset( $result['visibility'] ) );
	}

	/**
	 * Should return an extra viewable field on response when in edit context.
	 */
	function test_viewable_field() {
		wp_set_current_user( $this->administrator );
		$request = new WP_REST_Request( 'GET', '/wp/v2/types/post' );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$result   = $response->get_data();
		$this->assertTrue( isset( $result['viewable'] ) );
		$this->assertTrue( $result['viewable'] );
	}

	/**
	 * Should not return viewable field without context set.
	 */
	function test_viewable_field_without_context() {
		$request  = new WP_REST_Request( 'GET', '/wp/v2/types/post' );
		$response = rest_do_request( $request );
		$result   = $response->get_data();
		$this->assertFalse( isset( $result['viewable'] ) );
	}

	/**
	 * Only returns wp:action-assign-author when current user can assign author.
	 */
	function test_link_assign_author_only_appears_for_editor() {
		$post_id   = $this->factory->post->create();
		$check_key = 'https://api.w.org/action-assign-author';
		// authors cannot assign author.
		wp_set_current_user( $this->author );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertFalse( isset( $links[ $check_key ] ) );
		// editors can assign author.
		wp_set_current_user( $this->editor );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertTrue( isset( $links[ $check_key ] ) );
		// editors can assign author but not included for context != edit.
		wp_set_current_user( $this->editor );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'view' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertFalse( isset( $links[ $check_key ] ) );
	}

	/**
	 * Only returns wp:action-publish when current user can publish.
	 */
	function test_link_publish_only_appears_for_author() {
		$post_id   = $this->factory->post->create( array(
			'post_author' => $this->author,
		) );
		$check_key = 'https://api.w.org/action-publish';
		// contributors cannot sticky.
		wp_set_current_user( $this->contributor );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertFalse( isset( $links[ $check_key ] ) );
		// authors can publish.
		wp_set_current_user( $this->author );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertTrue( isset( $links[ $check_key ] ) );
		// authors can publish but not included for context != edit.
		wp_set_current_user( $this->author );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'view' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertFalse( isset( $links[ $check_key ] ) );
	}

	/**
	 * Only returns wp:action-sticky when current user can sticky.
	 */
	function test_link_sticky_only_appears_for_editor() {
		$post_id   = $this->factory->post->create();
		$check_key = 'https://api.w.org/action-sticky';
		// authors cannot sticky.
		wp_set_current_user( $this->author );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertFalse( isset( $links[ $check_key ] ) );
		// editors can sticky.
		wp_set_current_user( $this->editor );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertTrue( isset( $links[ $check_key ] ) );
		// editors can sticky but not included for context != edit.
		wp_set_current_user( $this->editor );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'view' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertFalse( isset( $links[ $check_key ] ) );
	}

	/**
	 * Should include relevant data in the 'theme_supports' key of index.
	 */
	function test_theme_supports_index() {
		$request  = new WP_REST_Request( 'GET', '/' );
		$response = rest_do_request( $request );
		$result   = $response->get_data();
		$this->assertTrue( isset( $result['theme_supports'] ) );
		$this->assertTrue( isset( $result['theme_supports']['formats'] ) );
		$this->assertTrue( in_array( 'standard', $result['theme_supports']['formats'] ) );
	}

	public function test_get_items_who_author_query() {
		wp_set_current_user( $this->administrator );
		// First request should include subscriber in the set.
		$request = new WP_REST_Request( 'GET', '/wp/v2/users' );
		$request->set_param( 'search', 'subscriber' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );
		$this->assertCount( 1, $response->get_data() );
		// Second request should exclude subscriber.
		$request = new WP_REST_Request( 'GET', '/wp/v2/users' );
		$request->set_param( 'who', 'authors' );
		$request->set_param( 'search', 'subscriber' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );
		$this->assertCount( 0, $response->get_data() );
	}

	/**
	 * Any user with 'edit_posts' on a show_in_rest post type
	 * can view authors. Others (e.g. subscribers) cannot.
	 */
	public function test_get_items_who_unauthorized_query() {
		wp_set_current_user( $this->subscriber );
		$request = new WP_REST_Request( 'GET', '/wp/v2/users' );
		$request->set_param( 'who', 'authors' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 403, $response->get_status() );
		$data = $response->get_data();
		$this->assertEquals( 'rest_forbidden_who', $data['code'] );
	}

	public function test_get_items_unbounded_per_page() {
		wp_set_current_user( $this->author );
		$request = new WP_REST_Request( 'GET', '/wp/v2/users' );
		$request->set_param( 'per_page', '-1' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );
	}

	public function test_get_items_unbounded_per_page_unauthorized() {
		wp_set_current_user( $this->subscriber );
		$request = new WP_REST_Request( 'GET', '/wp/v2/users' );
		$request->set_param( 'per_page', '-1' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 403, $response->get_status() );
		$data = $response->get_data();
		$this->assertEquals( 'rest_forbidden_per_page', $data['code'] );
	}

	public function test_get_pages_unbounded_per_page() {
		wp_set_current_user( $this->author );
		$this->factory->post->create( array( 'post_type' => 'page' ) );
		$request = new WP_REST_Request( 'GET', '/wp/v2/pages' );
		$request->set_param( 'per_page', '-1' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );
	}

	public function test_get_pages_unbounded_per_page_unauthorized() {
		wp_set_current_user( $this->subscriber );
		$this->factory->post->create( array( 'post_type' => 'page' ) );
		$request = new WP_REST_Request( 'GET', '/wp/v2/pages' );
		$request->set_param( 'per_page', '-1' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 403, $response->get_status() );
		$data = $response->get_data();
		$this->assertEquals( 'rest_forbidden_per_page', $data['code'] );
	}
}
