export async function onRequest({request}) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const limit = searchParams.get('limit')
    const radius = searchParams.get('radius')
    const url = `https://www.starbucks.com.cn/api/stores/nearby?lat=${lat}&lon=${lon}&limit=${limit}&locale=ZH&features=&radius=${radius}`;

    /**
     * gatherResponse awaits and returns a response body as a string.
     * Use await gatherResponse(..) in an async function to get the response body
     * @param {Response} response
     */
    async function gatherResponse(response) {
      const { headers } = response;
      const contentType = headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return JSON.stringify(await response.json());
      }
      return response.text();
    }

    const init = {
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    };

    const response = await fetch(url, init)
    const results = await gatherResponse(response);
    return new Response(results, init);

  } catch (error) {
    return new Response(error)
  }
};

