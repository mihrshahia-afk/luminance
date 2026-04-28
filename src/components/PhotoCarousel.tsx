import { useState, useEffect } from 'react';
import { X, MapPin, ExternalLink } from 'lucide-react';

interface Photo {
  url: string;
  alt: string;
  caption: string;
  location: string;
  source: string;
  sourceUrl: string;
}

// DatoCMS CDN image optimization — use fit=max to preserve full image (no cropping)
function opt(url: string, w: number): string {
  if (url.includes('datocms-assets.com')) return `${url}?auto=format&fit=max&w=${w}&q=70`;
  return url;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CURATED PHOTOS — All from official Bahá'í sources
// ═══════════════════════════════════════════════════════════════════════════════

const PHOTOS: Photo[] = [
  // ── BRISBANE YOUTH CONFERENCE (news.bahai.org/community-news/youth-conferences/brisbane.html) ──
  { url: 'https://news.bahai.org/images/photos/brisbane/brisbane-header.jpg', alt: 'Brisbane conference', caption: '550 youth from Queensland and northern New South Wales gathered for a youth conference.', location: 'Brisbane, Australia', source: 'BWNS Brisbane Youth Conference', sourceUrl: 'https://news.bahai.org/community-news/youth-conferences/brisbane.html' },
  { url: 'https://news.bahai.org/images/photos/brisbane/brisbane-1.jpg', alt: 'Traditional dance', caption: 'Participants perform a traditional dance as part of the opening of the conference.', location: 'Brisbane, Australia', source: 'BWNS Brisbane Youth Conference', sourceUrl: 'https://news.bahai.org/community-news/youth-conferences/brisbane.html' },
  { url: 'https://news.bahai.org/images/photos/brisbane/brisbane-2.jpg', alt: 'Youth study group', caption: 'A group of youth study one of the sections of the material together.', location: 'Brisbane, Australia', source: 'BWNS Brisbane Youth Conference', sourceUrl: 'https://news.bahai.org/community-news/youth-conferences/brisbane.html' },
  { url: 'https://news.bahai.org/images/photos/brisbane/brisbane-3.jpg', alt: 'Youth discussion', caption: 'Young people between the ages of 15 and 30 gathered to discuss how to better serve their communities.', location: 'Brisbane, Australia', source: 'BWNS Brisbane Youth Conference', sourceUrl: 'https://news.bahai.org/community-news/youth-conferences/brisbane.html' },
  { url: 'https://news.bahai.org/images/photos/brisbane/brisbane-5.jpg', alt: 'Study and fellowship', caption: 'The conference was filled with both purposeful study and joyful fellowship.', location: 'Brisbane, Australia', source: 'BWNS Brisbane Youth Conference', sourceUrl: 'https://news.bahai.org/community-news/youth-conferences/brisbane.html' },
  { url: 'https://news.bahai.org/images/photos/brisbane/brisbane-7.jpg', alt: 'Workshop group', caption: 'One of the large workshop groups studies the material with the assistance of a facilitator.', location: 'Brisbane, Australia', source: 'BWNS Brisbane Youth Conference', sourceUrl: 'https://news.bahai.org/community-news/youth-conferences/brisbane.html' },
  { url: 'https://news.bahai.org/images/photos/brisbane/brisbane-8.jpg', alt: 'Artistic illustration', caption: 'Each group came up with artistic ways to illustrate the concepts they had been exploring.', location: 'Brisbane, Australia', source: 'BWNS Brisbane Youth Conference', sourceUrl: 'https://news.bahai.org/community-news/youth-conferences/brisbane.html' },
  { url: 'https://news.bahai.org/images/photos/brisbane/brisbane-9.jpg', alt: 'Group deliberations', caption: 'A group shares the fruit of their deliberations.', location: 'Brisbane, Australia', source: 'BWNS Brisbane Youth Conference', sourceUrl: 'https://news.bahai.org/community-news/youth-conferences/brisbane.html' },
  { url: 'https://news.bahai.org/images/photos/brisbane/brisbane-10.jpg', alt: 'Creative concepts', caption: 'Groups created artistic representations of the concepts explored during the conference.', location: 'Brisbane, Australia', source: 'BWNS Brisbane Youth Conference', sourceUrl: 'https://news.bahai.org/community-news/youth-conferences/brisbane.html' },
  { url: 'https://news.bahai.org/images/photos/brisbane/brisbane-13.jpg', alt: 'Songs and art', caption: 'Songs and other artistic expressions were shared during both plenary and group sessions.', location: 'Brisbane, Australia', source: 'BWNS Brisbane Youth Conference', sourceUrl: 'https://news.bahai.org/community-news/youth-conferences/brisbane.html' },
  { url: 'https://news.bahai.org/images/photos/brisbane/brisbane-6.jpg', alt: 'Joyful atmosphere', caption: 'A spirit of joy and focus imbued the atmosphere.', location: 'Brisbane, Australia', source: 'BWNS Brisbane Youth Conference', sourceUrl: 'https://news.bahai.org/community-news/youth-conferences/brisbane.html' },
  { url: 'https://news.bahai.org/images/photos/brisbane/brisbane-12.jpg', alt: 'Songs from Writings', caption: "Participants shared songs inspired by the Baha'i Writings.", location: 'Brisbane, Australia', source: 'BWNS Brisbane Youth Conference', sourceUrl: 'https://news.bahai.org/community-news/youth-conferences/brisbane.html' },

  // ── AUSTRALIAN CONFERENCES — Perth, Melbourne (news.bahai.org/story/1586) ──
  { url: 'https://www.datocms-assets.com/6348/1646832329-global-conferences-fostering-peace-03.jpg', alt: 'Perth conference', caption: 'Approximately 1,000 participants of all ages attended the Western Australia conference.', location: 'Perth, Australia', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646832338-global-conferences-fostering-peace-04.jpg', alt: 'Perth youth', caption: 'Children and youth participants at the conference in Perth.', location: 'Perth, Australia', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646832347-global-conferences-fostering-peace-05.jpg', alt: 'Perth arts', caption: 'Artistic presentations at the Perth conference expressing themes of peace and unity.', location: 'Perth, Australia', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },

  // ── ARTS AT CONFERENCES — Melbourne and worldwide (news.bahai.org/story/1592) ──
  { url: 'https://www.datocms-assets.com/6348/1650964619-global-conferences-arts-peace-service-society-07.jpg', alt: 'Melbourne paintings', caption: 'Paintings on transformation and community at the Melbourne conference.', location: 'Melbourne, Australia', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964742-global-conferences-arts-peace-service-society-19.jpg', alt: 'Melbourne newspaper', caption: 'Newspaper articles envisioning a future society, created at the Melbourne conference.', location: 'Melbourne, Australia', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964535-global-conferences-arts-peace-service-society-01.jpg', alt: 'Art pieces Islamabad', caption: 'Art pieces on harmony, equality, and freedom from prejudice.', location: 'Islamabad, Pakistan', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964556-global-conferences-arts-peace-service-society-02.jpg', alt: 'Pop-up art Macedonia', caption: 'Collaborative pop-up art depicting a peaceful community.', location: 'Macedonia', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964569-global-conferences-arts-peace-service-society-03.jpg', alt: 'Hawaii artwork', caption: 'Collage of spiritual concept artwork created at the conference.', location: 'Hawaii, USA', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964577-global-conferences-arts-peace-service-society-04.jpg', alt: 'Children art Karachi', caption: "Children's artwork including garden and butterfly designs symbolizing growth.", location: 'Karachi, Pakistan', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964608-global-conferences-arts-peace-service-society-06.jpg', alt: 'Woven paper UK', caption: 'Woven paper art symbolizing interconnectedness.', location: 'United Kingdom', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964647-global-conferences-arts-peace-service-society-09.jpg', alt: 'Puppet show Argentina', caption: 'A puppet show about stewardship of the planet performed at the conference.', location: 'Argentina', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964656-global-conferences-arts-peace-service-society-10.jpg', alt: 'Basket weaving DRC', caption: 'Traditional basket weaving at the South Kivu conference.', location: 'South Kivu, DR Congo', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964673-global-conferences-arts-peace-service-society-12.jpg', alt: 'Drum band', caption: 'A drum band performance celebrating community spirit.', location: 'Dominican Republic', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964689-global-conferences-arts-peace-service-society-13.jpg', alt: 'Clay pendants', caption: 'Decorated clay pendants on unity and education.', location: 'Armenia', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964702-global-conferences-arts-peace-service-society-14.jpg', alt: 'Ancestral dances', caption: 'Ancestral dances celebrating diversity and cultural heritage.', location: 'Belgium', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964709-global-conferences-arts-peace-service-society-15.jpg', alt: 'Tree artwork Malaysia', caption: 'Tree artwork representing diversity and spiritual qualities.', location: 'Malaysia', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964714-global-conferences-arts-peace-service-society-16.jpg', alt: 'Children art Croatia', caption: "Children's art on societal betterment.", location: 'Croatia', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964725-global-conferences-arts-peace-service-society-17.jpg', alt: 'Tree artwork Mexico', caption: 'Colorful tree artwork symbolizing growth and community.', location: 'Colima, Mexico', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964752-global-conferences-arts-peace-service-society-20.jpg', alt: 'Singing Bolivia', caption: 'Singing participants raising their voices in unity at the conference.', location: 'Bolivia', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964766-global-conferences-arts-peace-service-society-22.jpg', alt: 'Bookmarks Colombia', caption: 'Bookmarks on the theme of betterment created by participants.', location: 'Puerto Tejada, Colombia', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964781-global-conferences-arts-peace-service-society-24.jpg', alt: 'Art pieces Jordan', caption: 'Collective art pieces expressing a community vision for the future.', location: 'Jordan', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964804-global-conferences-arts-peace-service-society-27.jpg', alt: 'Collaborative paintings SA', caption: 'Multicolored collaborative paintings created at the conference.', location: 'South Africa', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964832-global-conferences-arts-peace-service-society-30.jpg', alt: 'Dance Tajikistan', caption: 'Traditional dance and theatrical presentations at the conference.', location: 'Tajikistan', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },
  { url: 'https://www.datocms-assets.com/6348/1650964856-global-conferences-arts-peace-service-society-34.jpg', alt: 'Art UAE', caption: 'Collaborative art pieces on themes of unity and service.', location: 'United Arab Emirates', source: 'BWNS Arts at Conferences', sourceUrl: 'https://news.bahai.org/story/1592/' },

  // ── FOSTERING PEACE — worldwide conferences (news.bahai.org/story/1586) ──
  { url: 'https://www.datocms-assets.com/6348/1646834005-global-conferences-fostering-peace-06.jpg', alt: 'Bahrain conference', caption: 'Conferences brought together neighbours in multiple locations.', location: 'Bahrain', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646834012-global-conferences-fostering-peace-07.jpg', alt: 'Bangladesh gathering', caption: 'A three-day preparatory gathering for facilitators of upcoming conferences.', location: 'Bangladesh', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646834025-global-conferences-fostering-peace-09.jpg', alt: 'Bangladesh mayor', caption: 'Local Assembly members visiting the mayor with a conference invitation.', location: 'Rajshahi, Bangladesh', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646834032-global-conferences-fostering-peace-10.jpg', alt: 'Burundi gathering', caption: 'Local Spiritual Assembly members at a recent gathering.', location: 'Gawazi, Burundi', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646834037-global-conferences-fostering-peace-11.jpg', alt: 'Toronto conference', caption: 'Participants from northern, Atlantic, and Pacific regions gathered in Toronto.', location: 'Toronto, Canada', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646834060-global-conferences-fostering-peace-13.jpg', alt: 'Women conference CAR', caption: 'Approximately 500 women attending a conference on the role of women in peace.', location: 'Bangui, Central African Republic', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646833913-global-conferences-fostering-peace-17.jpg', alt: 'DRC gathering', caption: 'Multiple preparatory gatherings of local and regional institutions.', location: 'DR Congo', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646833922-global-conferences-fostering-peace-18.jpg', alt: 'DRC youth', caption: 'Additional preparatory gatherings with active youth participation.', location: 'DR Congo', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646833931-global-conferences-fostering-peace-19.jpg', alt: 'Kinshasa gathering', caption: 'A gathering of community members in Kinshasa.', location: 'Kinshasa, DR Congo', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646833942-global-conferences-fostering-peace-20.jpg', alt: 'Ecuador gathering', caption: 'Over 200 institutional representatives from nine countries across South America.', location: 'Ecuador', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646833950-global-conferences-fostering-peace-21.jpg', alt: 'Egypt conference', caption: 'Conference with discussions and film screening in Port Said.', location: 'Port Said, Egypt', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646833956-global-conferences-fostering-peace-22.jpg', alt: 'Egypt youth', caption: 'Youth and children participants at recent gatherings.', location: 'Egypt', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646833964-global-conferences-fostering-peace-23.jpg', alt: 'Frankfurt gathering', caption: "Representatives gathered at the Baha'i House of Worship in Frankfurt.", location: 'Frankfurt, Germany', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646834644-global-conferences-fostering-peace-34.jpg', alt: 'Kenya gathering', caption: 'National gathering for consultation on upcoming nationwide conferences.', location: 'Kenya', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646834655-global-conferences-fostering-peace-35.jpg', alt: 'Kenya preparation', caption: 'Preparatory gathering ahead of upcoming conferences.', location: 'Kenya', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646834668-global-conferences-fostering-peace-36.jpg', alt: 'Malaysia gathering', caption: 'Regional gathering with participants from Brunei, Indonesia, and Singapore.', location: 'Malaysia', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646834680-global-conferences-fostering-peace-37.jpg', alt: 'Mozambique gathering', caption: 'National gathering participants preparing for upcoming conferences.', location: 'Mozambique', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646834689-global-conferences-fostering-peace-39.jpg', alt: 'Namibia conference', caption: 'National conference preparing for 14 conferences across the country.', location: 'Windhoek, Namibia', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646834698-global-conferences-fostering-peace-40.jpg', alt: 'Netherlands painting', caption: 'Painting expressing human diversity and interconnectedness.', location: 'Netherlands', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646834718-global-conferences-fostering-peace-42.jpg', alt: 'Netherlands art', caption: 'Creating artistic expressions of concepts discussed at the gathering.', location: 'Netherlands', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646835758-global-conferences-fostering-peace-45.jpg', alt: 'Karachi participants', caption: 'National gathering participants.', location: 'Karachi, Pakistan', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646835784-global-conferences-fostering-peace-47.jpg', alt: 'Panama conference', caption: 'Conference welcoming over 1,000 participants, primarily indigenous Ngabe-Bugle people.', location: 'Panama', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646903627-global-conferences-fostering-peace-48.jpg', alt: 'Panama gathering', caption: 'Conference in the Besiko district with indigenous communities.', location: 'Alto Naranjo, Panama', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646835811-global-conferences-fostering-peace-49.jpg', alt: 'PNG gathering', caption: 'Over 100 participants from New Caledonia, PNG, Solomon Islands, and Vanuatu.', location: 'Lae, Papua New Guinea', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646835821-global-conferences-fostering-peace-50.jpg', alt: 'PNG participants', caption: 'Gathering participants from across the Pacific region.', location: 'Lae, Papua New Guinea', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646835581-global-conferences-fostering-peace-52.jpg', alt: 'Qatar gathering', caption: 'Neighbourhood gathering featuring musical and artistic presentations.', location: 'Qatar', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646835602-global-conferences-fostering-peace-55.jpg', alt: 'Timor-Leste meeting', caption: 'National Spiritual Assembly meeting with institutional members for conference planning.', location: 'Timor-Leste', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646835606-global-conferences-fostering-peace-56.jpg', alt: 'Timor-Leste youth', caption: 'Conference organized by young women with village chief participation.', location: 'Oecusse, Timor-Leste', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646835620-global-conferences-fostering-peace-57.jpg', alt: 'UAE youth', caption: 'Conference focusing on the role of youth in social transformation.', location: 'Ajman, UAE', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646835638-global-conferences-fostering-peace-58.jpg', alt: 'Dubai conference', caption: 'Local conference participants discussing service to society.', location: 'Dubai, UAE', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646835680-global-conferences-fostering-peace-59.jpg', alt: 'London gathering', caption: 'Representatives from Ireland, Denmark, Finland, Iceland, Norway, Sweden, UK, and Greenland.', location: 'London, UK', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646835695-global-conferences-fostering-peace-60.jpg', alt: 'London session', caption: 'Gathering session with participants from across northern Europe.', location: 'London, UK', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646835708-global-conferences-fostering-peace-61.jpg', alt: 'Vanuatu arrival', caption: "Institutional members arriving for the national gathering at the Baha'i House of Worship.", location: 'Tanna, Vanuatu', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646835732-global-conferences-fostering-peace-62.jpg', alt: 'Vanuatu temple', caption: "Meeting space constructed near the newly opened Baha'i House of Worship.", location: 'Tanna, Vanuatu', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646903708-global-conferences-fostering-peace-63.jpg', alt: 'Vanuatu sessions', caption: 'Gathering sessions at the national conference.', location: 'Tanna, Vanuatu', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646835745-global-conferences-fostering-peace-64.jpg', alt: 'Zambia gathering', caption: 'Regional gathering of representatives from Angola, Malawi, Namibia, Zambia, and Zimbabwe.', location: 'Zambia', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },

  // ── INDIA CONFERENCES (news.bahai.org/story/1586) ──
  { url: 'https://www.datocms-assets.com/6348/1646834770-global-conferences-fostering-peace-26.jpg', alt: 'India facilitator training', caption: 'Facilitator training sessions for local conferences.', location: 'India', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646834784-global-conferences-fostering-peace-27.jpg', alt: 'India conferences', caption: 'Conferences in Maharashtra, Uttar Pradesh, and West Bengal.', location: 'India', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646834794-global-conferences-fostering-peace-28.jpg', alt: 'India participants', caption: 'Participants from Madhya Pradesh, Manipur, and Uttar Pradesh conferences.', location: 'India', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646834818-global-conferences-fostering-peace-29.jpg', alt: 'India diverse', caption: 'Conferences in Rajasthan, Maharashtra, and Tamil Nadu.', location: 'India', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },

  // ── JORDAN CONFERENCES (news.bahai.org/story/1586) ──
  { url: 'https://www.datocms-assets.com/6348/1646834858-global-conferences-fostering-peace-31.jpg', alt: 'Jordan conversations', caption: "'Conversations to build society' gatherings with NGO and faith community representatives.", location: 'Amman, Jordan', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646834874-global-conferences-fostering-peace-32.jpg', alt: 'Jordan children', caption: 'Children participating in conference discussions on gender equality.', location: 'Northern Jordan', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },
  { url: 'https://www.datocms-assets.com/6348/1646834881-global-conferences-fostering-peace-33.jpg', alt: 'Jordan community building', caption: "Participants reflecting on community-building activities including children's moral education.", location: 'Weibdeh, Jordan', source: 'BWNS Fostering Peace', sourceUrl: 'https://news.bahai.org/story/1586/' },

  // ── 2022 WORLD CONFERENCES — Queensland, Australia (bahaiblog.net) ──
  { url: 'https://www.bahaiblog.net/wp-content/uploads/2022/07/What-kind-of-World-864x486-1.jpg', alt: 'What Kind of World musical', caption: "'What Kind of World' — a musical play performed by Queensland youth at the 2022 World Conferences, telling the story of Clara and Hyde Dunn who brought the Baha'i Faith to Australia.", location: 'Queensland, Australia', source: "Baha'i Blog — 2022 World Conferences", sourceUrl: 'https://www.bahaiblog.net/articles/music/music-from-the-2022-world-conferences-of-queensland/' },
  { url: 'https://www.bahaiblog.net/wp-content/uploads/2022/06/Music-from-the-2022-World-Conferences-of-Queensland-864x550-1.jpg', alt: 'Queensland conference music', caption: 'Music from the 2022 World Conferences of Queensland — seven songs performed at conferences in Cairns, Gold Coast, and Brisbane, later professionally recorded.', location: 'Queensland, Australia', source: "Baha'i Blog — 2022 World Conferences", sourceUrl: 'https://www.bahaiblog.net/articles/music/music-from-the-2022-world-conferences-of-queensland/' },
  { url: 'https://www.bahaiblog.net/wp-content/uploads/2022/07/Australia-2022-World-Conferences-864x486-1.jpg', alt: 'Australia 2022 conferences', caption: 'A glimpse into the 2022 World Conferences held across Australia, part of a global series of conferences launching a new phase of community building.', location: 'Australia', source: "Baha'i Blog — 2022 World Conferences", sourceUrl: 'https://www.bahaiblog.net/articles/music/music-from-the-2022-world-conferences-of-queensland/' },
  { url: 'https://www.bahaiblog.net/wp-content/uploads/2022/07/Paradise-Queensland-Conferences-864x486-1.jpg', alt: 'Paradise song Queensland', caption: "'Paradise' — one of seven songs from the Queensland World Conferences, inspired by themes of hope and the vision of a better world.", location: 'Queensland, Australia', source: "Baha'i Blog — 2022 World Conferences", sourceUrl: 'https://www.bahaiblog.net/articles/music/music-from-the-2022-world-conferences-of-queensland/' },

  // ── AUSTRALIAN BAHA'I COMMUNITY (horizons.bahai.org.au, bahaiblog.net) ──
  { url: 'https://www.bahaiblog.net/wp-content/uploads/2025/12/Brisbane-Youth-Journey-to-Bahai-Temple-in-Preparation-for-Summer-of-Service-629x468-1.jpg', alt: 'Brisbane youth temple visit', caption: "Brisbane youth journeyed to the Baha'i House of Worship in Sydney as part of their preparation for a Summer of Service.", location: 'Sydney, Australia', source: "Baha'i Blog", sourceUrl: 'https://www.bahaiblog.net/' },

  // ── BAHÁ'Í WORLD CENTRE — International Conventions (media.bahai.org) ──
  { url: 'https://www.datocms-assets.com/98132/1704050722-9935119-master.jpg', alt: 'International Convention', caption: "Delegates at an International Baha'i Convention at the Baha'i World Centre in Haifa, Israel.", location: 'Haifa, Israel', source: "Baha'i Media Bank", sourceUrl: 'https://media.bahai.org/gatherings-conferences/international-gatherings-conferences/' },
  { url: 'https://www.datocms-assets.com/98132/1704050715-9187655-master.jpg', alt: 'World Centre gathering', caption: "Participants gathered at the Baha'i World Centre for an international event.", location: 'Haifa, Israel', source: "Baha'i Media Bank", sourceUrl: 'https://media.bahai.org/gatherings-conferences/international-gatherings-conferences/' },
  { url: 'https://www.datocms-assets.com/98132/1704050707-8991994-master.jpg', alt: 'Convention delegates', caption: "Delegates from national Baha'i communities at an International Convention.", location: 'Haifa, Israel', source: "Baha'i Media Bank", sourceUrl: 'https://media.bahai.org/gatherings-conferences/international-gatherings-conferences/' },
  { url: 'https://www.datocms-assets.com/98132/1704050699-8935799-master.jpg', alt: 'Seat of Universal House of Justice', caption: "Delegates gathered at the Seat of the Universal House of Justice on Mount Carmel.", location: 'Haifa, Israel', source: "Baha'i Media Bank", sourceUrl: 'https://media.bahai.org/gatherings-conferences/international-gatherings-conferences/' },
  { url: 'https://www.datocms-assets.com/98132/1704050689-8382226-master.jpg', alt: 'International delegates', caption: "Delegates from around the world consulting at the Baha'i World Centre.", location: 'Haifa, Israel', source: "Baha'i Media Bank", sourceUrl: 'https://media.bahai.org/gatherings-conferences/international-gatherings-conferences/' },
  { url: 'https://www.datocms-assets.com/98132/1704050680-8214023-master.jpg', alt: 'World Centre event', caption: "An event at the Baha'i World Centre bringing together representatives from every continent.", location: 'Haifa, Israel', source: "Baha'i Media Bank", sourceUrl: 'https://media.bahai.org/gatherings-conferences/international-gatherings-conferences/' },
  { url: 'https://www.datocms-assets.com/98132/1704050669-6959846-master.jpg', alt: 'Historic convention', caption: "An historic International Convention at the Baha'i World Centre.", location: 'Haifa, Israel', source: "Baha'i Media Bank", sourceUrl: 'https://media.bahai.org/gatherings-conferences/international-gatherings-conferences/' },
  { url: 'https://www.datocms-assets.com/98132/1704050655-6780644-master.jpg', alt: 'Convention session', caption: "A convention session at the Baha'i World Centre.", location: 'Haifa, Israel', source: "Baha'i Media Bank", sourceUrl: 'https://media.bahai.org/gatherings-conferences/international-gatherings-conferences/' },
  { url: 'https://www.datocms-assets.com/98132/1704050643-6535831-master.jpg', alt: 'Delegates on Carmel', caption: "Convention delegates on Mount Carmel, Haifa.", location: 'Haifa, Israel', source: "Baha'i Media Bank", sourceUrl: 'https://media.bahai.org/gatherings-conferences/international-gatherings-conferences/' },
  { url: 'https://www.datocms-assets.com/98132/1704050625-6470922-master.jpg', alt: 'International gathering', caption: "Participants at an international gathering at the World Centre.", location: 'Haifa, Israel', source: "Baha'i Media Bank", sourceUrl: 'https://media.bahai.org/gatherings-conferences/international-gatherings-conferences/' },

  // ── NEIGHBOURHOOD ACTIVITIES — Queensland Australia (news.bahai.org/story/1845) ──
  { url: 'https://www.datocms-assets.com/6348/1766689616-2025-year-in-review-46.jpg', alt: 'Queensland community garden', caption: 'Families in rural Queensland tending a streetside garden as part of community-building efforts.', location: 'Gracemere, Queensland, Australia', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766689619-2025-year-in-review-47.jpg', alt: 'Youth agricultural initiative', caption: 'Youth participating in agricultural initiatives, learning about sustainability and service.', location: 'Gracemere, Queensland, Australia', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766689622-2025-year-in-review-48.jpg', alt: 'Children composting', caption: 'Children composting in a community garden, learning to care for the environment.', location: 'Gracemere, Queensland, Australia', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766689625-2025-year-in-review-49.jpg', alt: 'Youth tending garden', caption: 'Youth tending a neighbourhood garden, growing food for the community.', location: 'Gracemere, Queensland, Australia', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766689628-2025-year-in-review-50.jpg', alt: 'Homework club', caption: 'Community gardening inspiring a homework club initiative for neighbourhood children.', location: 'Gracemere, Queensland, Australia', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766689631-2025-year-in-review-51.jpg', alt: 'Homework club participants', caption: 'Children participating in a neighbourhood homework club that grew out of community-building activities.', location: 'Gracemere, Queensland, Australia', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766689638-2025-year-in-review-52.jpg', alt: 'Permaculture farming', caption: 'Permaculture farming for community well-being — growing food and building bonds.', location: 'Gracemere, Queensland, Australia', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766689640-2025-year-in-review-53.jpg', alt: 'Chicken pen project', caption: 'Youth and children building a community chicken pen — learning responsibility through service.', location: 'Gracemere, Queensland, Australia', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766689642-2025-year-in-review-54.jpg', alt: 'Beekeeping demonstration', caption: 'A beekeeping demonstration teaching sustainable practices to neighbourhood youth.', location: 'Gracemere, Queensland, Australia', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },

  // ── NEIGHBOURHOOD ACTIVITIES — Worldwide (news.bahai.org) ──
  { url: 'https://www.datocms-assets.com/6348/1766687061-2025-year-in-review-01.jpg', alt: 'Moral education program', caption: "Participants in a Baha'i moral and spiritual education program exploring themes of service.", location: 'International', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766687065-2025-year-in-review-02.jpg', alt: 'Mexico community building', caption: 'Neighbours in Mexico consulting together on the betterment of their local community.', location: 'Mexico', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766687073-2025-year-in-review-03.jpg', alt: 'Youth service activities', caption: 'Youth engaged in service activities, developing capacity to contribute to community life.', location: 'International', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766687078-2025-year-in-review-04.jpg', alt: 'Mexican youth education', caption: 'Young people in Mexico fostering peaceful neighbourhoods through moral education.', location: 'Mexico', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766687084-2025-year-in-review-05.jpg', alt: 'Community building', caption: 'Young people engaged in community-building activities in their neighbourhood.', location: 'International', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766687088-2025-year-in-review-06.jpg', alt: 'Families and neighbours', caption: 'Families and neighbours strengthening connections through service to each other.', location: 'International', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766687774-2025-year-in-review-09.jpg', alt: 'Youth painting walls', caption: 'Young volunteers painting walls in a neighbourhood affected by flooding — turning disaster into service.', location: 'Paiporta, Spain', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766687780-2025-year-in-review-11.jpg', alt: 'Children education post-disaster', caption: "Educational programs creating joyful spaces for children in communities recovering from disaster.", location: 'Spain', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766687786-2025-year-in-review-12.jpg', alt: 'Youth cleaning riverbanks', caption: 'Youth cleaning riverbanks — channelling community bonds into environmental stewardship.', location: 'Ribarroja, Spain', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766687812-2025-year-in-review-16.jpg', alt: 'Street cleanup', caption: 'A community street cleanup effort bringing neighbours together in service.', location: 'Pasadena, USA', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },

  // ── NEIGHBOURHOOD ACTIVITIES — Kiribati, Colombia, Zambia (news.bahai.org/story/1845) ──
  { url: 'https://www.datocms-assets.com/6348/1766765382-1766689921-2025-year-in-review-55.jpg', alt: 'Kiribati families', caption: 'Families in Kiribati learning about consultation and cooperation in community life.', location: 'Kiribati', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766689923-2025-year-in-review-56.jpg', alt: 'Kiribati social action', caption: 'A social action initiative bringing neighbours together for the common good.', location: 'Kiribati', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766689926-2025-year-in-review-57.jpg', alt: 'Moral education session', caption: 'Community members participating in a moral and spiritual education session.', location: 'Kiribati', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766691215-2025-year-in-review-75.jpg', alt: 'Children dancing Colombia', caption: 'Children dancing at a local FUNDAEC community celebration in Colombia.', location: 'Colombia', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766691221-2025-year-in-review-78.jpg', alt: 'Dancers at gathering', caption: 'Dancers performing at a community gathering celebrating education and service.', location: 'Colombia', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766732820-2025-year-in-review-90.jpg', alt: 'School opening', caption: 'Community members celebrating the opening of a new school built through collective effort.', location: 'Katuyola, Zambia', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766732889-2025-year-in-review-91.jpg', alt: 'School opening ceremony', caption: 'Community members and leaders at the opening ceremony of a school serving the neighbourhood.', location: 'Zambia', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766732907-2025-year-in-review-92.jpg', alt: 'Parents and teachers', caption: 'Parents and teachers exploring a community-centred vision for education.', location: 'Zambia', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },
  { url: 'https://www.datocms-assets.com/6348/1766732924-2025-year-in-review-93.jpg', alt: 'Teachers lesson planning', caption: 'Teachers at a lesson planning session, developing approaches rooted in moral education.', location: 'Zambia', source: 'BWNS 2025 Year in Review', sourceUrl: 'https://news.bahai.org/story/1845/2025-year-in-review' },

  // ── NEIGHBOURHOOD ACTIVITIES — Sydney, Vancouver, Ecuador (news.bahai.org) ──
  { url: 'https://www.datocms-assets.com/6348/1616077107-abc-casts-light-bahai-community-building-sydney-neighborhood-01.jpeg', alt: 'Mount Druitt community', caption: 'Vibrant community life in Mount Druitt, Sydney — neighbours gathering for activities that strengthen bonds.', location: 'Mount Druitt, Sydney, Australia', source: 'BWNS Sydney Neighbourhood', sourceUrl: 'https://news.bahai.org/story/1498/' },
  { url: 'https://www.datocms-assets.com/6348/1616076711-abc-casts-light-bahai-community-building-sydney-neighborhood-02.jpeg', alt: 'Youth park improvement', caption: "Mayor Tony Bleasdale visiting youth in Mount Druitt to acknowledge their park improvement efforts.", location: 'Mount Druitt, Sydney, Australia', source: 'BWNS Sydney Neighbourhood', sourceUrl: 'https://news.bahai.org/story/1498/' },
  { url: 'https://www.datocms-assets.com/6348/1616076714-abc-casts-light-bahai-community-building-sydney-neighborhood-03.png', alt: 'Community prayer and music', caption: 'Community gatherings for prayer, discussion, and music in Mount Druitt.', location: 'Mount Druitt, Sydney, Australia', source: 'BWNS Sydney Neighbourhood', sourceUrl: 'https://news.bahai.org/story/1498/' },
  { url: 'https://www.datocms-assets.com/6348/1567088775-americas-spirit-oneness-moves-communities-anticipation-bicentenary-02.jpg', alt: 'Vancouver neighbourhood', caption: "Residents in a diverse neighbourhood of Vancouver intensifying community-building efforts, including children's festivals bringing together local families.", location: 'Vancouver, Canada', source: 'BWNS Americas Community Building', sourceUrl: 'https://news.bahai.org/story/1348/' },
  { url: 'https://www.datocms-assets.com/6348/1567088778-americas-spirit-oneness-moves-communities-anticipation-bicentenary-03.jpg', alt: 'Toronto youth camp', caption: 'Youth in Toronto participating in a three-day camp which included an arts night and service planning.', location: 'Toronto, Canada', source: 'BWNS Americas Community Building', sourceUrl: 'https://news.bahai.org/story/1348/' },
  { url: 'https://www.datocms-assets.com/6348/1567088797-americas-spirit-oneness-moves-communities-anticipation-bicentenary-10.jpg', alt: 'Colombia House of Worship', caption: "Community members studying and reflecting on the grounds of the Baha'i House of Worship in Agua Azul.", location: 'Agua Azul, Colombia', source: 'BWNS Americas Community Building', sourceUrl: 'https://news.bahai.org/story/1348/' },

  // ── EDUCATION & SERVICE (news.bahai.org) ──
  { url: 'https://www.datocms-assets.com/6348/1702626516-banani-school-30-years-empowering-women-04.jpg', alt: 'Students teaching', caption: 'Students from Banani School teaching at a nearby elementary school as part of a service project.', location: 'Zambia', source: 'BWNS Banani School', sourceUrl: 'https://news.bahai.org/story/1706/' },
  { url: 'https://www.datocms-assets.com/6348/1702626508-banani-school-30-years-empowering-women-05.jpg', alt: 'Banani celebration', caption: 'Some 600 people gathered on school grounds to honour three decades of educating girls.', location: 'Zambia', source: 'BWNS Banani School', sourceUrl: 'https://news.bahai.org/story/1706/' },
  { url: 'https://www.datocms-assets.com/6348/1604504376-f12.jpg', alt: 'Outdoor neighbourhood class', caption: "Teachers at Ridvan School providing outdoor neighbourhood classes for children — adapting education to serve the community.", location: 'El Salvador', source: 'BWNS 2020 Review', sourceUrl: 'https://news.bahai.org/story/1478/' },
  { url: 'https://www.datocms-assets.com/6348/1586793432-providing-food-security-global-health-crisis-00.jpg', alt: 'Food security Vanuatu', caption: "Participants in Vanuatu's Preparation for Social Action program addressing food security through local agriculture.", location: 'Vanuatu', source: 'BWNS 2020 Review', sourceUrl: 'https://news.bahai.org/story/1478/' },
];

// Split into rows
const half = Math.ceil(PHOTOS.length / 2);
const ROW_1 = PHOTOS.slice(0, half);
const ROW_2 = PHOTOS.slice(half);

// ═══════════════════════════════════════════════════════════════════════════════

function PhotoModal({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  // Use the raw URL without any CDN transforms on mobile — simpler, more reliable
  const imgUrl = photo.url;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex flex-col"
      onClick={onClose}
    >
      {/* Close button */}
      <div className="absolute top-4 right-4 z-10">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/20 border-none cursor-pointer flex items-center justify-center text-white">
          <X size={22} />
        </button>
      </div>

      {/* Image — takes up the top portion */}
      <div className="flex-1 flex items-center justify-center p-2 min-h-0" onClick={onClose}>
        <img
          src={imgUrl}
          alt={photo.alt}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>

      {/* Info bar at the bottom */}
      <div className="bg-black/90 px-4 py-4 sm:py-5 shrink-0" onClick={e => e.stopPropagation()}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-1.5 mb-1.5">
            <MapPin size={12} className="text-gold shrink-0" />
            <span className="text-[0.7rem] font-body text-gold tracking-wide uppercase">{photo.location}</span>
          </div>
          <p className="text-[0.85rem] text-white/90 leading-relaxed m-0 mb-2 font-reading">{photo.caption}</p>
          <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[0.65rem] text-white/50 no-underline hover:text-gold transition-colors font-body">
            <ExternalLink size={10} />
            {photo.source}
          </a>
        </div>
      </div>
    </div>
  );
}


export default function PhotoCarousel() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());

  const row1 = ROW_1.filter(p => !failedUrls.has(p.url));
  const row2 = ROW_2.filter(p => !failedUrls.has(p.url));

  // Doubled for seamless loop
  const loop1 = [...row1, ...row1];
  const loop2 = [...row2, ...row2];

  return (
    <div className="py-6 sm:py-10 overflow-hidden">
      <div className="text-center mb-4 sm:mb-8">
        <p className="font-body text-[0.65rem] sm:text-[0.75rem] tracking-[0.4em] uppercase text-gold mb-2 sm:mb-3">Around the World</p>
        <h2 className="font-display text-[clamp(1.2rem,3vw,2rem)] font-light text-heading m-0">
          Communities in Action
        </h2>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {[{ photos: loop1, dir: 'left', speed: 180 }, { photos: loop2, dir: 'right', speed: 200 }].map(({ photos, dir, speed }, rowIdx) => (
          <div key={rowIdx} className="overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-24 z-10" style={{ background: 'linear-gradient(to right, var(--bg-page), transparent)' }} />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-24 z-10" style={{ background: 'linear-gradient(to left, var(--bg-page), transparent)' }} />
            <div
              className="flex gap-1.5 sm:gap-3 carousel-track"
              style={{
                animation: `${dir === 'left' ? 'scrollLeft' : 'scrollRight'} ${speed}s linear infinite`,
                width: 'max-content',
                willChange: 'transform',
              }}
            >
              {photos.map((photo, i) => (
                <button
                  key={`${photo.url}-${i}`}
                  onClick={() => setSelectedPhoto(photo)}
                  className="w-[120px] h-[75px] sm:w-[280px] sm:h-[175px] rounded-md sm:rounded-xl overflow-hidden shrink-0 bg-border-inner border-none p-0 cursor-pointer group relative"
                >
                  <img
                    src={opt(photo.url, 250)}
                    alt={photo.alt}
                    loading={i < 5 ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={() => setFailedUrls(prev => new Set(prev).add(photo.url))}
                    className="w-full h-full object-cover sm:transition-transform sm:duration-500 sm:group-hover:scale-110"
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {selectedPhoto && <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />}
    </div>
  );
}
