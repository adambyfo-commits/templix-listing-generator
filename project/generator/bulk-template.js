// Bulk-update template column list + a sample first row.
// Lives at the top level so app.jsx can build the XLSX client-side
// (no static-file download warnings).

window.BULK_TEMPLATE_HEADERS = [
  'Bundle ID','Tier','Bundle Name','Price',
  'hero_title','hero_metric','hero_tagline',
  'hero_feature_1','hero_feature_2','hero_feature_3','hero_feature_4',
  'hero_tile_1_label','hero_tile_2_label','hero_tile_3_label',
  'hero_tile_1_icon','hero_tile_2_icon','hero_tile_3_icon',
  'inc_title','inc_subtitle','inc_footer',
  'inc_col1_title','inc_col2_title','inc_col3_title','inc_col4_title','inc_col5_title',
  ...[1,2,3,4,5].flatMap(c => [1,2,3,4,5].map(b => `inc_col${c}_bullet_${b}`)),
  'inc_col1_icon','inc_col2_icon','inc_col3_icon','inc_col4_icon','inc_col5_icon',
  ...[1,2,3,4,5].flatMap(p => {
    const pp = `p0${p}`;
    return [`${pp}_title`,`${pp}_subtitle`,`${pp}_tab_1`,`${pp}_tab_2`,`${pp}_tab_3`,
            `${pp}_feature_1`,`${pp}_feature_2`,`${pp}_feature_3`,`${pp}_feature_4`,
            `${pp}_product_id`,`${pp}_cover_url`];
  }),
  ...[1,2,3,4].flatMap(a => [`aud_${a}_name`,`aud_${a}_cta`,
    `aud_${a}_bullet_1`,`aud_${a}_bullet_2`,`aud_${a}_bullet_3`]),
  ...[1,2,3,4,5,6].flatMap(c => [`colour_${c}_name`,`colour_${c}_hex`,
    `colour_${c}_word_1`,`colour_${c}_word_2`]),
  'try_headline','try_subhead','try_bullet_1','try_bullet_2','try_bullet_3','try_bullet_4','try_cta',
  ...[1,2,3,4,5].flatMap(q => [`quick_${q}_label`,`quick_${q}_page_url`]),
  'cover_image',
  'hero_tablet_1_url','hero_tablet_2_url','hero_tablet_3_url','hero_tablet_4_url','hero_tablet_5_url',
  'handedness_screen_url',
  'try_tablet_1_url','try_tablet_2_url','try_tablet_3_url','try_tablet_4_url','try_tablet_5_url',
];

window.BULK_TEMPLATE_SAMPLE = {
  'Bundle ID': 'PL01',
  'Tier': 'Plus',
  'Bundle Name': 'Meetings Starter',
  'Price': '$4.99',
  'hero_title': 'Meetings Starter',
  'hero_metric': '4,899 Pages · 3 Products',
  'hero_tagline': 'Starter Bundle for reMarkable — Daily Life Planner + Reflection & Habits + ADHD Daily Planner',
  'hero_feature_1': 'Left & Right Handed Versions',
  'hero_feature_2': '6 Color Editions',
  'hero_feature_3': 'Fully Hyperlinked System',
  'hero_feature_4': '5 Language Systems',
  'hero_tile_1_label': 'Optimized\nPages',
  'hero_tile_2_label': 'Multi-Purpose\nSystem',
  'hero_tile_3_label': 'Seamless\nNavigation',
  'hero_tile_1_icon': 'stack',
  'hero_tile_2_icon': 'modules',
  'hero_tile_3_icon': 'nav',
  'inc_title': "What's Included",
  'inc_subtitle': 'Everything inside your Starter Bundle',
  'inc_footer': 'Starter Bundle — all products in one download.',
  'inc_col1_title': 'Daily Life Planner',
  'inc_col2_title': 'Reflection & Habits',
  'inc_col3_title': 'ADHD Daily Planner',
  'inc_col5_title': 'Bonus Content',
  'cover_image': 'https://d2xsxph8kpxj0f.cloudfront.net/.../ds02/cover.png',
};
