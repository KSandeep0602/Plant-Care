const API_KEY = process.env.TREFLE_API_KEY;

async function testSearch() {
  if (!API_KEY) {
    console.log('TREFLE_API_KEY not found');
    return;
  }

  try {
    const response = await fetch(`https://trefle.io/api/v1/plants/search?token=${API_KEY}&q=grape`);
    const data = await response.json();

    console.log('API Response:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testSearch();