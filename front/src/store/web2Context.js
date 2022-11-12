import React, {useState} from "react";

import config from "../config.js";

const Web2Context = React.createContext({
    loadingServer: false,
});

export const Web2ContextProvider = (props) => {
    const [loadingServer, setLoadingServer] = useState(false);

	const getData = async () => {
		setLoadingServer(true);
		let response = await fetch(
			config.api,
			{
				mode: 'cors',
				credentials: 'same-origin',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
			},
		);
		const data = await response.text();
    	const jsonData = JSON.parse(data);
    	console.log({ jsonData });
		setLoadingServer(false);
    }

    return (
        <Web2Context.Provider
            value={{
                loadingServer,
            }}>
            {props.children}
        </Web2Context.Provider>
    )
}

export default Web2Context;