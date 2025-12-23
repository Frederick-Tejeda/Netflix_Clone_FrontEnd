import { useState, useEffect } from "react"
const PUBLIC_RAPIDAPI_API_KEY = import.meta.env.PUBLIC_RAPIDAPI_API_KEY;

export default function Player ({url}){

    const [final_movie, setFinal_movie] = useState({id: "", imdb_id: ""})
    const [new_url, setNew_url] = useState("")
    const [message, setMessage] = useState("Loading...")

    let index_of_params = url.indexOf('?')
    let url_with_params = url.substring(index_of_params + 1)
    let params = url_with_params.split("&")
    let dic_of_params = {title: "", release_year: "", isMovie: ""}
    params.forEach((param) => {
      let [key, value] = param.split('=')
      dic_of_params[key] = value
    })
    let [title, release_year, isMovie] = [decodeURIComponent(dic_of_params['title']), dic_of_params['release_date'].split('-')[0], dic_of_params['isMovie'].split('-')[0]]
    let low_title = title.toLocaleLowerCase()
    let url_to_fetch = new URL(`https://imdb-movies-web-series-etc-search.p.rapidapi.com/=${low_title.replaceAll(" ", "")}.json`)

    const MediaNoFound = () => {
      // console.log('Media no Found')
      setMessage('Media no Found')
    }

  const LookForMovie = async (movie_results) => {
    // console.log({title, release_year})
    movie_results = movie_results.filter((e) => e?.title == title && e?.year == release_year)
    // console.log({movie_results})
      movie_results.forEach(async element => {
        const url = `https://imdb188.p.rapidapi.com/api/v1/searchIMDB?query=${element.imdb_id}`;
        const options = {
          method: 'GET',
          headers: {
            'x-rapidapi-key': PUBLIC_RAPIDAPI_API_KEY,
            'x-rapidapi-host': 'imdb188.p.rapidapi.com'
          }
        };
        try {
          const response = await fetch(url, options);
          const result = await response.json();
          // console.log({result})
          if(result.data !== undefined){
            const data_result = await result.data.filter((e) => e?.year == release_year && e?.title == title)[0]
            setFinal_movie(data_result)
          }
        } catch (error) {
          console.error(error);
        }
      });
  }

  const GetMovieInfo = async () => {
    let media_results = []
    try{
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': PUBLIC_RAPIDAPI_API_KEY,
          'x-rapidapi-host': 'imdb-movies-web-series-etc-search.p.rapidapi.com',
        }
      };
      // console.log({options})
      const response = await fetch(url_to_fetch, options);
      // console.log({response})
      const result = await response.json();
      media_results = result?.d
      // console.log({isMovie})
      // console.log({media_results})
      if(!media_results || media_results.length < 1){
        MediaNoFound()
        return
      }

      // console.log({low_title})
      await media_results.forEach((a) => {
        if(a['l'].toLocaleLowerCase() == low_title && a['y'] == release_year){
          setFinal_movie(a)
          console.log({final_movie})
        }
      })
      if(media_results.length > 1){
        LookForMovie(media_results)
      }
    }catch(err){
      console.log('Error', err)
    }
  }

  const Iframe = () => {
    return(
      <div style={{width: "100%", height: "96dvh"}}>
        <iframe style={{width: "100%", height: "100%"}} src={new_url} referrerPolicy="origin" allow="autoplay" allowFullScreen></iframe>
      </div>
    )
  }
  
  useEffect(() => {
    GetMovieInfo()
  }, [])
  
  useEffect(() => {
    if (final_movie != undefined) setNew_url((isMovie == "true") ? `https://vidsrc-me.su/embed/movie?imdb=${final_movie?.id}` : `https://vidsrc-me.su/embed/tv?imdb=${final_movie?.id}&season=1&episode=1`)
    // console.log({final_movie})
  }, [final_movie])

    return(
      <div className="player">
          {(final_movie?.id || final_movie?.imdb_id) ? ( <Iframe /> ) : ( <h1>{message}</h1> )} 
      </div>
    )
}