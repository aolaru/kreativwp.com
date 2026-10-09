<?php
$content = '<!-- wp:heading {"level":1} --><h1 class="wp-block-heading">A calmer place to build your next idea.</h1><!-- /wp:heading -->
<!-- wp:paragraph --><p>We help small teams make thoughtful websites. This representative page uses WordPress core blocks and the same text for every theme in the KreativWP test.</p><!-- /wp:paragraph -->
<!-- wp:buttons --><div class="wp-block-buttons"><!-- wp:button --><div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="?page_id=2">Explore our approach</a></div><!-- /wp:button --></div><!-- /wp:buttons -->
<!-- wp:heading --><h2 class="wp-block-heading">Three useful starting points</h2><!-- /wp:heading -->
<!-- wp:columns --><div class="wp-block-columns"><!-- wp:column --><div class="wp-block-column"><!-- wp:heading {"level":3} --><h3 class="wp-block-heading">A clear workflow</h3><!-- /wp:heading --><!-- wp:paragraph --><p>Publish a real page and find out whether everyday editing feels manageable.</p><!-- /wp:paragraph --></div><!-- /wp:column --><!-- wp:column --><div class="wp-block-column"><!-- wp:heading {"level":3} --><h3 class="wp-block-heading">A smaller stack</h3><!-- /wp:heading --><!-- wp:paragraph --><p>Keep only the tools the site needs, and check the boundaries of the free edition.</p><!-- /wp:paragraph --></div><!-- /wp:column --><!-- wp:column --><div class="wp-block-column"><!-- wp:heading {"level":3} --><h3 class="wp-block-heading">An easier handoff</h3><!-- /wp:heading --><!-- wp:paragraph --><p>Try phone navigation and the editing process before committing to a long-term design.</p><!-- /wp:paragraph --></div><!-- /wp:column --></div><!-- /wp:columns -->
<!-- wp:heading --><h2 class="wp-block-heading">Build with your own content</h2><!-- /wp:heading -->
<!-- wp:paragraph --><p>A theme needs to work with actual headings, links, navigation, and paragraphs. An empty installation cannot tell us whether a complete site will be fast or accessible.</p><!-- /wp:paragraph -->';
$landing = wp_insert_post(['post_type' => 'page', 'post_title' => 'Our approach', 'post_status' => 'publish', 'post_content' => $content]);
$journal = wp_insert_post(['post_type' => 'page', 'post_title' => 'Journal', 'post_status' => 'publish']);
wp_update_post(['ID' => 1, 'post_title' => 'Small changes make a site easier to maintain', 'post_content' => '<!-- wp:paragraph --><p>A short, representative article for the KreativWP theme lab. We are testing the free theme with WordPress core blocks.</p><!-- /wp:paragraph --><!-- wp:heading --><h2 class="wp-block-heading">Start with one real workflow</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Try writing, publishing, and revising this content. Check the reading experience on desktop and mobile.</p><!-- /wp:paragraph -->']);
update_option('show_on_front', 'page');
update_option('page_on_front', $landing);
update_option('page_for_posts', $journal);
update_option('blog_public', 0);
$menu = wp_create_nav_menu('Primary');
foreach ([$landing => 'Our approach', $journal => 'Journal'] as $id => $label) {
  wp_update_nav_menu_item($menu, 0, ['menu-item-title' => $label, 'menu-item-object-id' => $id, 'menu-item-object' => 'page', 'menu-item-type' => 'post_type', 'menu-item-status' => 'publish']);
}
echo wp_json_encode(['landing' => $landing, 'journal' => $journal, 'post' => 1, 'menu' => $menu]);
