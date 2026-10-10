// Local design examples only. They are never written to the API.
const artwork = '/streamflix/v25/titles/';
const samples = [
  ['Dune: Part Two', 'Movie', 'Sci-Fi, Adventure', 'Featured', 'Published', '2024', '2026-05-15', 'dune-part-two'],
  ['Interstellar', 'Movie', 'Sci-Fi, Drama', 'Featured', 'Published', '2014', '2026-05-10', 'interstellar'],
  ['The Fall Guy', 'Movie', 'Action, Comedy', 'Action', 'Published', '2024', '2026-05-08', 'the-fall-guy'],
  ['Stranger Things S4', 'Series', 'Sci-Fi, Horror', 'Series', 'Published', '2022', '2026-04-28', 'stranger-things'],
  ['The Witcher S3', 'Series', 'Fantasy, Action', 'Series', 'Draft', '2023', '2026-04-22', 'the-witcher'],
  ['The Godfather', 'Movie', 'Crime, Drama', 'Classic', 'Published', '1972', '2026-04-15', 'the-godfather'],
];
export const previewData = {
  content: samples.map(([title, type, genre_name, category, status, year, created_at, slug], i) => ({
    content_id: i + 1, title, type, genre_name, category, status, created_at,
    release_date: year + '-01-01', poster_url: artwork + slug + '-poster.webp',
    preview_url: artwork + slug + '-preview.webp', genre_id: i + 1, license_id: i + 1,
    licensor_name: ['Warner Bros.', 'Paramount Pictures', 'Universal Pictures', 'Netflix', 'Netflix', 'Paramount Pictures'][i],
    description: title, synopsis: 'Sample record for reviewing the original admin layout.', age_rating: 'PG-13',
  })),
  genres: ['Sci-Fi', 'Drama', 'Action', 'Horror', 'Fantasy', 'Crime'].map((genre_name, i) => ({genre_id: i + 1, genre_name})),
  licenses: ['Warner Bros.', 'Paramount Pictures', 'Universal Pictures', 'Netflix'].map((licensor_name, i) => ({license_id: i + 1, licensor_name, expiration_date: '2027-01-15'})),
  users: [{user_id: 1, full_name: 'Alex Morgan', email: 'alex@example.com', account_status: 'active', created_at: '2026-05-10'}, {user_id: 2, full_name: 'Jamie Lee', email: 'jamie@example.com', account_status: 'active', created_at: '2026-06-15'}, {user_id: 3, full_name: 'Sam Rivera', email: 'sam@example.com', account_status: 'active', created_at: '2026-07-20'}],
  plans: [{plan_id: 1, plan_name: 'Standard',max_members:1,monthly_price:299,is_active:true}, {plan_id: 2, plan_name: 'Premium',max_members:4,monthly_price:499,is_active:true}],
  subscriptions: [1,2,3].map((id,i) => ({subscription_id:id,subscription_user_id:id,plan_id:i === 0 ? 2 : 1,start_date:new Date(Date.now()-30*86400000).toISOString().slice(0,10),end_date:new Date(Date.now()+[3,25,-2][i]*86400000).toISOString().slice(0,10),status:'active',created_at:'2026-09-01'})),
  assets: [
    {asset_id: 1, name: 'Mickey 17 poster', kind: 'Image', folder: 'Posters', url: '/admin-design/mickey-17.webp', created_at: '2026-05-15'},
    {asset_id: 2, name: 'Dune: Part Two artwork', kind: 'Image', folder: 'Backdrops', url: '/admin-design/dune.webp', created_at: '2026-05-15'},
    {asset_id: 3, name: 'Netflix logo', kind: 'Image', folder: 'Studio logos', url: '/admin-design/netflix.webp', created_at: '2026-05-15'},
    {asset_id: 4, name: 'Warner Bros. logo', kind: 'Image', folder: 'Studio logos', url: '/admin-design/warner-bros.png', created_at: '2026-05-15'},
  ],
  settings: {platformName: 'StreamFlix', tagline: 'Your world of entertainment', supportEmail: 'support@example.com', language: 'English', timezone: 'Asia/Manila'},
};
