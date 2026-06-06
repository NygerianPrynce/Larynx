// City data for the Outreach tool.
// - METROS: one-click presets that expand to a whole metro ring (solves the
//   "searching one city misses surrounding towns" problem).
// - CITIES_BY_STATE: pick a state, then multi-select cities. Tennessee is built out
//   comprehensively (the current market); other states list major cities and can be
//   expanded on request.

// Metro presets per state. Picking a state shows its metros; each expands to the
// whole surrounding ring. (States without a defined metro still get the universal
// "All <State> cities" quick-pick in the UI.)
export const METROS_BY_STATE = {
  'Tennessee': {
    'Nashville Metro': [
      'Nashville, TN', 'Franklin, TN', 'Brentwood, TN', 'Murfreesboro, TN',
      'Hendersonville, TN', 'Smyrna, TN', 'Gallatin, TN', 'Mount Juliet, TN',
      'Nolensville, TN', 'Spring Hill, TN', 'Lebanon, TN', 'La Vergne, TN',
      'Goodlettsville, TN', 'White House, TN', 'Springfield, TN', 'Dickson, TN',
      'Columbia, TN', 'Fairview, TN', 'Portland, TN',
    ],
    'Memphis Metro': ['Memphis, TN', 'Germantown, TN', 'Collierville, TN', 'Bartlett, TN', 'Cordova, TN'],
    'Knoxville Metro': ['Knoxville, TN', 'Maryville, TN', 'Oak Ridge, TN', 'Farragut, TN', 'Alcoa, TN', 'Sevierville, TN'],
    'Chattanooga Metro': ['Chattanooga, TN', 'East Ridge, TN', 'Cleveland, TN'],
  },
  'Georgia': {
    'Atlanta Metro': ['Atlanta, GA', 'Marietta, GA', 'Alpharetta, GA', 'Roswell, GA'],
  },
  'Texas': {
    'Dallas–Fort Worth': ['Dallas, TX', 'Fort Worth, TX', 'Plano, TX', 'Frisco, TX', 'Arlington, TX'],
    'Greater Houston': ['Houston, TX'],
    'Austin Metro': ['Austin, TX'],
  },
  'North Carolina': {
    'Charlotte Metro': ['Charlotte, NC'],
    'Raleigh–Durham': ['Raleigh, NC', 'Durham, NC', 'Cary, NC'],
  },
  'Florida': {
    'Miami Metro': ['Miami, FL', 'Fort Lauderdale, FL'],
    'Orlando Metro': ['Orlando, FL'],
    'Tampa Bay': ['Tampa, FL', 'St. Petersburg, FL'],
  },
  'California': {
    'Los Angeles Metro': ['Los Angeles, CA', 'Long Beach, CA', 'Anaheim, CA', 'Irvine, CA'],
    'Bay Area': ['San Francisco, CA', 'San Jose, CA', 'Oakland, CA'],
    'San Diego Metro': ['San Diego, CA'],
  },
  'New York': {
    'NYC Metro': ['New York, NY', 'Brooklyn, NY', 'Yonkers, NY'],
  },
}

export const CITIES_BY_STATE = {
  'Tennessee': [
    'Nashville, TN', 'Franklin, TN', 'Brentwood, TN', 'Murfreesboro, TN',
    'Hendersonville, TN', 'Smyrna, TN', 'Gallatin, TN', 'Mount Juliet, TN',
    'Nolensville, TN', 'Spring Hill, TN', 'Lebanon, TN', 'La Vergne, TN',
    'Goodlettsville, TN', 'White House, TN', 'Springfield, TN', 'Dickson, TN',
    'Columbia, TN', 'Fairview, TN', 'Portland, TN', 'Memphis, TN', 'Germantown, TN',
    'Collierville, TN', 'Bartlett, TN', 'Cordova, TN', 'Knoxville, TN',
    'Maryville, TN', 'Oak Ridge, TN', 'Farragut, TN', 'Alcoa, TN', 'Sevierville, TN',
    'Gatlinburg, TN', 'Pigeon Forge, TN', 'Chattanooga, TN', 'East Ridge, TN',
    'Cleveland, TN', 'Clarksville, TN', 'Johnson City, TN', 'Kingsport, TN',
    'Bristol, TN', 'Jackson, TN', 'Cookeville, TN', 'Morristown, TN', 'Tullahoma, TN',
  ],
  'Alabama': ['Birmingham, AL', 'Montgomery, AL', 'Huntsville, AL', 'Mobile, AL', 'Tuscaloosa, AL', 'Auburn, AL'],
  'Arizona': ['Phoenix, AZ', 'Tucson, AZ', 'Mesa, AZ', 'Scottsdale, AZ', 'Chandler, AZ', 'Tempe, AZ', 'Gilbert, AZ'],
  'Arkansas': ['Little Rock, AR', 'Fayetteville, AR', 'Fort Smith, AR', 'Springdale, AR', 'Bentonville, AR'],
  'California': ['Los Angeles, CA', 'San Diego, CA', 'San Jose, CA', 'San Francisco, CA', 'Sacramento, CA', 'Fresno, CA', 'Long Beach, CA', 'Oakland, CA', 'Irvine, CA', 'Anaheim, CA'],
  'Colorado': ['Denver, CO', 'Colorado Springs, CO', 'Aurora, CO', 'Boulder, CO', 'Fort Collins, CO', 'Lakewood, CO'],
  'Connecticut': ['Hartford, CT', 'New Haven, CT', 'Stamford, CT', 'Bridgeport, CT', 'Norwalk, CT'],
  'Florida': ['Miami, FL', 'Orlando, FL', 'Tampa, FL', 'Jacksonville, FL', 'Fort Lauderdale, FL', 'St. Petersburg, FL', 'Tallahassee, FL', 'Sarasota, FL', 'Naples, FL'],
  'Georgia': ['Atlanta, GA', 'Savannah, GA', 'Augusta, GA', 'Athens, GA', 'Macon, GA', 'Marietta, GA', 'Alpharetta, GA', 'Roswell, GA'],
  'Illinois': ['Chicago, IL', 'Naperville, IL', 'Springfield, IL', 'Peoria, IL', 'Evanston, IL', 'Aurora, IL'],
  'Indiana': ['Indianapolis, IN', 'Fort Wayne, IN', 'Bloomington, IN', 'Carmel, IN', 'Fishers, IN'],
  'Kentucky': ['Louisville, KY', 'Lexington, KY', 'Bowling Green, KY', 'Owensboro, KY', 'Covington, KY'],
  'Louisiana': ['New Orleans, LA', 'Baton Rouge, LA', 'Lafayette, LA', 'Shreveport, LA'],
  'Maryland': ['Baltimore, MD', 'Columbia, MD', 'Annapolis, MD', 'Rockville, MD', 'Bethesda, MD'],
  'Massachusetts': ['Boston, MA', 'Cambridge, MA', 'Worcester, MA', 'Springfield, MA', 'Somerville, MA'],
  'Michigan': ['Detroit, MI', 'Grand Rapids, MI', 'Ann Arbor, MI', 'Lansing, MI', 'Royal Oak, MI'],
  'Minnesota': ['Minneapolis, MN', 'St. Paul, MN', 'Rochester, MN', 'Bloomington, MN', 'Edina, MN'],
  'Mississippi': ['Jackson, MS', 'Gulfport, MS', 'Southaven, MS', 'Hattiesburg, MS', 'Oxford, MS'],
  'Missouri': ['Kansas City, MO', 'St. Louis, MO', 'Springfield, MO', 'Columbia, MO'],
  'Nevada': ['Las Vegas, NV', 'Henderson, NV', 'Reno, NV', 'Sparks, NV'],
  'New Jersey': ['Newark, NJ', 'Jersey City, NJ', 'Hoboken, NJ', 'Princeton, NJ', 'Edison, NJ'],
  'New York': ['New York, NY', 'Brooklyn, NY', 'Buffalo, NY', 'Rochester, NY', 'Albany, NY', 'Syracuse, NY', 'Yonkers, NY'],
  'North Carolina': ['Charlotte, NC', 'Raleigh, NC', 'Durham, NC', 'Greensboro, NC', 'Winston-Salem, NC', 'Asheville, NC', 'Cary, NC', 'Wilmington, NC'],
  'Ohio': ['Columbus, OH', 'Cleveland, OH', 'Cincinnati, OH', 'Dayton, OH', 'Akron, OH'],
  'Oklahoma': ['Oklahoma City, OK', 'Tulsa, OK', 'Norman, OK', 'Edmond, OK'],
  'Oregon': ['Portland, OR', 'Eugene, OR', 'Salem, OR', 'Bend, OR', 'Beaverton, OR'],
  'Pennsylvania': ['Philadelphia, PA', 'Pittsburgh, PA', 'Allentown, PA', 'Harrisburg, PA', 'Lancaster, PA'],
  'South Carolina': ['Charleston, SC', 'Columbia, SC', 'Greenville, SC', 'Myrtle Beach, SC', 'Mount Pleasant, SC'],
  'Texas': ['Houston, TX', 'Dallas, TX', 'Austin, TX', 'San Antonio, TX', 'Fort Worth, TX', 'El Paso, TX', 'Plano, TX', 'Frisco, TX', 'Arlington, TX'],
  'Utah': ['Salt Lake City, UT', 'Provo, UT', 'Park City, UT', 'Ogden, UT', 'Lehi, UT'],
  'Virginia': ['Virginia Beach, VA', 'Richmond, VA', 'Arlington, VA', 'Alexandria, VA', 'Norfolk, VA', 'Charlottesville, VA'],
  'Washington': ['Seattle, WA', 'Spokane, WA', 'Tacoma, WA', 'Bellevue, WA', 'Redmond, WA', 'Olympia, WA'],
  'Wisconsin': ['Milwaukee, WI', 'Madison, WI', 'Green Bay, WI', 'Kenosha, WI'],
}

export const STATES = Object.keys(CITIES_BY_STATE).sort()
