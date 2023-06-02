
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import * as React from "react";

const SmartNFTPortal = (props) => { 
    const {smartImports, metadata, style, loading, random, className} = props;
    let loadingContent = props.loadingContent;
    let ROOT = props.apiRoot;
    if (!loadingContent) { 
        loadingContent=(
            <>
                Loading...
            </>
        );
    }
    if (!ROOT || ROOT=='') { 
        ROOT='/api';
    }
    const iFrameRef = useRef();
    let src='';
    let librariesHTML ='';
    
    useEffect(() => {
        window.addEventListener("message", onMessage);
        return () => { 
            window.removeEventListener("message", onMessage)
        }
      }, []);
      
    if (loading) { 
        return loadingContent;
        //return <CircularProgress style={{marginTop: '2em', marginLeft: 'auto', marginRight: 'auto'}} />;
    }
    
    const dataURItoString = (dataURI) => {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
        var byteString = '';
        if (dataURI.split(',')[0].includes('base64')) { 
            byteString = Buffer.from(dataURI.split(',')[1], 'hex').toString();
        } else { 
            byteString = decodeURIComponent(dataURI.split(',')[1]);
        }
        console.log(byteString);
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
      
        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);
      
        // create a view into the buffer
        var ia = new Uint8Array(ab);
      
        // set the bytes of the buffer to the correct values
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
      
        // write the ArrayBuffer to a blob, and you're done
        var blob = new Blob([ab], {type: mimeString});
        
        return new TextDecoder().decode(ia);
      
    }
    const postData = async (url = '', inData) => {
        return fetch(ROOT + url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(inData)
        })
  
    }
    const getData = async (url = '') => {
        return fetch(ROOT + url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        })
    }
    const onMessage = (e) => { 
        switch (e.data.request) { 
            case 'getTokenThumb':
                return onGetTokenThumb(e);
            case 'getTokenImage': 
                return onGetTokenImage(e);
            case 'getFile':
                return onGetFile(e);
            case 'getTransactions':
                return onGetTransactions(e);
            case 'getTokens':
                return onGetTokens(e);
            case 'getUTXOs': 
                return onGetUTXOs(e);
            case 'getMetadata':
                return onGetMetadata(e);
            default:
                return;
        }
    }
    const onGetTokenThumb = (e) => { 
        getData('/tokenImageFromUnit?unit='+e.data.unit+'&size=256').then((img) => { 
            if (img.status == 200) {
                img.blob().then((blob) => { 
                    blob.arrayBuffer().then((buffer) => { 
                        if (!iFrameRef.current) return; // user browsed away
                        iFrameRef.current.contentWindow.postMessage({
                            request: 'getTokenThumb',
                            unit: e.data.unit, 
                            mediaType: img.mediaType,
                            buffer
                        },'*', [buffer]);
                    });
                })                    
            } else { 
                if (!iFrameRef.current) return; // user browsed away
                iFrameRef.current.contentWindow.postMessage({
                    request: 'getTokenThumb',
                    unit: e.data.unit, 
                    error: {
                        message: 'HTTP Error '+img.status+' from backend API', 
                        code: img.status
                    }
                }, '*');
            }
        });
    }
    const onGetTokenImage = (e) => { 
        getData('/tokenImageFromUnit?unit='+e.data.unit).then((img) => { 
            if (img.status == 200) {
                img.blob().then((blob) => { 
                    blob.arrayBuffer().then((buffer) => { 
                        if (!iFrameRef.current) return; // user browsed away
                        iFrameRef.current.contentWindow.postMessage({
                            request: 'getTokenImage',
                            unit: e.data.unit, 
                            mediaType: img.mediaType,
                            buffer
                        },'*', [buffer]);
                    });
                })
            } else { 
                if (!iFrameRef.current) return; // user browsed away
                iFrameRef.current.contentWindow.postMessage({
                    request: 'getTokenImage',
                    unit: e.data.unit, 
                    error: {
                        message: 'HTTP Error '+img.status+' from backend API', 
                        code: img.status
                    }
                },'*');
            }
        });
    }
    const onGetFile = (e) => { 
        postData('/getFile',{unit: e.data.unit, id: e.data.id, metadata: e.data.metadata}).then((res) => {
            if (res.status == 200) {
                res.blob().then(blob => { 
                    blob.arrayBuffer().then((buffer) => { 
                        if (!iFrameRef.current) return; // user browsed away
                        iFrameRef.current.contentWindow.postMessage({
                            request: 'getFile',
                            id: e.data.id,
                            unit: e.data.unit, 
                            mediaType: res.mediaType,
                            buffer
                        },'*',[buffer]);
                    });
                });
            } else { 
                if (!iFrameRef.current) return; // user browsed away
                iFrameRef.current.contentWindow.postMessage({
                    request: 'getFile',
                    id: e.data.id,
                    unit: e.data.unit, 
                    error: {
                        message: 'HTTP Error '+res.status+' from backend API', 
                        code: res.status
                    }
                },'*');
            }
        })        
    }
    const onGetMetadata = (e) => { 
        postData('/getMetadata',{unit: e.data.unit}).then((res) => {
            if (res.status == 200) {
                res.json().then(result => {      
                    if (!iFrameRef.current) return; // user browsed away
                    iFrameRef.current.contentWindow.postMessage({
                        request: 'getMetadata',
                        unit: e.data.unit, 
                        result
                    },'*')
                });
            } else { 
                if (!iFrameRef.current) return; // user browsed away
                iFrameRef.current.contentWindow.postMessage({
                    request: 'getMetadata',
                    unit: e.data.unit, 
                    error: {
                        message: 'HTTP Error '+res.status+' from backend API', 
                        code: res.status
                    }
                },'*')
            }
        });      
    }
    const onGetTransactions = (e) => { 
        postData('/getTransactions',{which: e.data.which, page: e.data.page}).then((res) => { 
            if (res.status == 200) {
                res.json().then(result => {      
                    if (!iFrameRef.current) return; // user browsed away
                    iFrameRef.current.contentWindow.postMessage({
                        request: 'getTransactions',
                        which: e.data.which, 
                        page: e.data.page, 
                        result
                    },'*');   
                });
            } else { 
                if (!iFrameRef.current) return; // user browsed away
                iFrameRef.current.contentWindow.postMessage({
                    request: 'getTransactions',
                    which: e.data.which, 
                    page: e.data.page, 
                    error: {
                        message: 'HTTP Error '+res.status+' from backend API', 
                        code: res.status
                    }
                },'*');   
            }
        });        
    }
    const onGetTokens = (e) => { 
        postData('/getTokens',{which: e.data.which, page: e.data.page}).then((res) => { 
            if (res.status == 200) {
                res.json().then(result => {      
                    if (!iFrameRef.current) return; // user browsed away
                    iFrameRef.current.contentWindow.postMessage({
                        request: 'getTokens', 
                        which: e.data.which, 
                        page: e.data.page,
                        result 
                    },'*')
                })
            } else { 
                if (!iFrameRef.current) return; // user browsed away
                iFrameRef.current.contentWindow.postMessage({
                    request: 'getTokens', 
                    which: e.data.which, 
                    page: e.data.page, 
                    error: {
                        message: 'HTTP Error '+res.status+' from backend API', 
                        code: res.status
                    }
                },'*')
            }
        });
    }
    const onGetUTXOs = (e) => { 
        postData('/getUTXOs',{which: e.data.which, page: e.data.page}).then((res) => { 
            if (res.status == 200) {
                res.json().then(result => {      
                    if (!iFrameRef.current) return; // user browsed away
                    iFrameRef.current.contentWindow.postMessage({
                        request: 'getUTXOs',
                        which: e.data.which,
                        page: e.data.page, 
                        result
                    }, '*')
                });
            } else { 
                if (!iFrameRef.current) return; // user browsed away
                iFrameRef.current.contentWindow.postMessage({
                    request: 'getUTXOs',
                    which: e.data.which, 
                    page: e.data.page, 
                    error: {
                        message: 'HTTP Error '+res.status+' from backend API', 
                        code: res.status
                    }
                }, '*')
            }
        });       
    }

    if (smartImports && smartImports.libraries && smartImports.libraries.length>0) { 
        for (var c=0; c<smartImports.libraries.length; c++) {
            librariesHTML+='<script src="'+smartImports.libraries[c]+'"></script>'
        }
    }
    librariesHTML+=getPortalAPIScripts(smartImports, metadata);
    if (metadata && metadata.files && metadata.files[0]) { 
        let newSrc = metadata.files[0].src; // Todo - this line and the line above assume that the text/html program code will be the first element in the files array
        if (Array.isArray(newSrc)) { 
            newSrc = newSrc.join('');
        }
        let blob = dataURItoString(newSrc); 
        blob = '<html data-id="'+random+'" ><head>'+librariesHTML+'</head><body style="padding: 0; margin: 0px; min-width: 100%; min-height: 100%;"}>'+blob+'</body></html>';
        src='data:text/html,'+encodeURIComponent(blob)
    }
    // Here the actual iframe that does all the work:
    return (
        <iframe ref={iFrameRef} style={style} className={className} sandbox="allow-scripts" src={src} />
    );
}

// This is the API that's provided to the child iframe:
const getPortalAPIScripts = (smartImports, metadata) => { 

    let ret="<script>\n";
    ret+="if (!window.cardano) window.cardano={};\n";
    ret+="if (!window.cardano.nft) window.cardano.nft={};\n";
    ret+="if (!window.cardano.nft._data) window.cardano.nft._data={};\n";

    ret+="window.cardano.nft._data.ownerAddr="+JSON.stringify(smartImports?.ownerAddr)+";\n";
    ret+="window.cardano.nft._data.fetchedAt="+JSON.stringify(smartImports?.fetchedAt)+";\n";
    ret+="window.cardano.nft._data.tokenUnit="+JSON.stringify(smartImports.tokenUnit)+";\n";
    ret+="window.cardano.nft._data.metadata="+JSON.stringify(metadata)+";\n";
    if (smartImports?.utxos) { 
        ret+='window.cardano.nft._data.utxos='+JSON.stringify(smartImports.utxos)+";\n";
    }
    if (smartImports?.tokens) { 
        ret+='window.cardano.nft._data.tokens='+JSON.stringify(smartImports.tokens)+";\n";
    }
    if (smartImports?.transactions) { 
        ret+='window.cardano.nft._data.transactions='+JSON.stringify(smartImports.transactions)+";\n";   
    }
    if (smartImports?.mintTx) { 
        ret+='window.cardano.nft._data.mintTx='+JSON.stringify(smartImports.mintTx)+";\n";
    }
    ret+='</script>';

    // I wanna read this from a separate .js file, but I can't work out how to have it done in the preprocessor so that there's no need for an async call in the client side
    let filesAPIJS = `
        window.cardano.nft.getTokenThumb = async (unit) => {
            console.error('Attempt to use getTokenThumb without importing files API');
        }
        window.cardano.nft.getTokenThumbUrl = async (unit) => {
            console.error('Attempt to use getTokenThumbUrl without importing files API');
        }
        window.cardano.nft.getTokenImage = async (unit) => { 
            console.error('Attempt to use getTokenImage without importing files API');
        }
        window.cardano.nft.getTokenImageUrl = async (unit) => { 
            console.error('Attempt to use getTokenImageUrl without importing files API');
        }
        window.cardano.nft.getFile = async (id=null, unit=null) => { 
            console.error('Attempt to use getFile without importing files API');
        }
        window.cardano.nft.getFileUrl = async (id=null, unit=null) => { 
            console.error('Attempt to use getFileUrl without importing files API');
        }
        window.cardano.nft.getMetadata = async (unit='own') => { 
            if (unit=='own') return window.cardano.nft._data.metadata;
            console.error('Attempt to use getMetadata on an external NFT without importing files API');
        }
    `;
    
    if (smartImports?.files) { 
        filesAPIJS=`
        window.cardano.nft.getTokenThumb = async (unit) => {
            return new Promise(async (resolve,reject) => { 
                const messageHandler = (e) => { 
                    if (e.data.request=='getTokenThumb' && e.data.unit == unit && !e.data.error) {
                        window.removeEventListener('message',messageHandler);
                        resolve(e.data.buffer);
                    } else if (e.data.request=='getTokenThumb' && e.data.unit == unit && e.data.error) { 
                        window.removeEventListener('message',messageHandler);
                        reject(e.data.error);
                    }
                }
                window.addEventListener('message',messageHandler);
                parent.postMessage({request:'getTokenThumb',unit},'*');
            });
        }
        window.cardano.nft.getTokenThumbUrl = async (unit) => { 
            return URL.createObjectURL(new Blob([await window.cardano.nft.getTokenThumb(unit)]));
        }
        window.cardano.nft.getTokenImage = async (unit) => { 
            return new Promise(async (resolve, reject) => { 
                const messageHandler = (e) => { 
                    if (e.data.request=='getTokenImage' && e.data.unit == unit && !e.data.error) { 
                        window.removeEventListener('message',messageHandler);
                        resolve(e.data.buffer);
                    } else if (e.data.request=='getTokenImage' && e.data.unit == unit && e.data.error) { 
                        window.removeEventListener('message',messageHandler);
                        reject(e.data.error);
                    }
                }
                window.addEventListener('message',messageHandler);
                parent.postMessage({request:'getTokenImage',unit},'*')
            });
        }
        window.cardano.nft.getTokenImageUrl = async (unit) => { 
            return URL.createObjectURL(new Blob([await window.cardano.nft.getTokenImage(unit)]));
        }
        window.cardano.nft.getFile = async (id=null, unit='own') => { 
            return new Promise(async (resolve, reject) => { 
                const messageHandler = (e) => { 
                    if (e.data.request=='getFile' && e.data.id == id && e.data.unit == unit && !e.data.error) { 
                        window.removeEventListener('message',messageHandler);
                        resolve(e.data.buffer);
                    } else if (e.data.request=='getFile' && e.data.id == id && e.data.unit == unit && e.data.error) { 
                        window.removeEventListener('message',messageHandler);
                        reject(e.data.error);
                    }
                }
                window.addEventListener('message',messageHandler);
                parent.postMessage({request:'getFile',id,unit, metadata:window.cardano.nft._data.metadata},'*');
            });
        }
        window.cardano.getFileUrl = async (id=null, unit='own') => { 
            return URL.createObjectURL(new Blob([await window.cardano.nft.getFile(id, unit)]));
        }
        window.cardano.nft.getMetadata = async (unit='own') => { 
            if (unit=='own') return window.cardano.nft._data.metadata;
            return new Promise(async (resolve, reject) => { 
                const messageHandler = (e) => { 
                    if (e.data.request=='getMetadata' && e.data.unit==unit && !e.data.error) { 
                        window.removeEventListener('message',messageHandler);
                        resolve(e.data.result);
                    } else if (e.data.request=='getMetadata' && e.data.unit==unit && e.data.error) { 
                        window.removeEventListener('message',messageHandler);
                        reject(e.data.error);;
                    }
                }
                window.addEventListener('message',messageHandler);
                parent.postMessage({request:'getMetadata', unit},'*')
            });
        }
        `;
    }
    ret+=`
        <script>
            ${filesAPIJS}
            window.cardano.nft.getOwner = async () => { 
                return window.cardano.nft._data.ownerAddr;
            }
            window.cardano.nft.getMintTx = async () => { 
                if (window.cardano.nft._data.mintTx) return window.cardano.nft._data.mintTx;
                console.error('Attempt to use mintTx without importing the API');
            }
            window.cardano.nft.getTokenUnit = async () => { 
                return window.cardano.nft._data.tokenUnit;
            }
            // This is a shortcut so you can get this data synchronously
            window.cardano.nft.mintTx = window.cardano.nft._data.mintTx;
            window.cardano.nft.tokenUnit = window.cardano.nft._data.tokenUnit;

            // This is a shortcut to get the metadata for the current token synchronously
            window.cardano.nft.metadata = window.cardano.nft._data.metadata;
            
            window.cardano.nft.getTransactions = async (which='own', page=0) => { 
                if (which=='own') { 
                    which=window.cardano.nft._data.ownerAddr;
                }
                if (page==0) { 
                    return {transactions: window.cardano.nft._data.transactions[which], fetchedAt: window.cardano.nft._data.fetchedAt};
                } else if (window.cardano.nft._data.transactions[which]) { 
                    return new Promise(async (resolve, reject) => { 
                        const messageHandler = (e) => { 
                            if (e.data.request=='getTransactions' && e.data.which==which && e.data.page==page && !e.data.error) { 
                                window.removeEventListener('message',messageHandler);
                                resolve(e.data.result);
                            } else if (e.data.request=='getTransactions' && e.data.which==which && e.data.page==page && e.data.error) { 
                                window.removeEventListener('message',messageHandler);
                                reject(e.data.error);
                            }
                        }
                        window.addEventListener('message',messageHandler);
                        parent.postMessage({request:'getTransactions', which, page},'*');
                    });
                } else { 
                    console.error('Attempt to access transactions that haven\\'t been imported');
                }
            }
            window.cardano.nft.getTokens = async (which='own', page=0) => { 
                if (which=='own') { 
                    which=window.cardano.nft._data.ownerAddr;
                }
                if (page==0) { 
                    return {tokens: window.cardano.nft._data.tokens[which], fetchedAt: window.cardano.nft._data.fetchedAt};
                } else if (window.cardano.nft._data.tokens[which]) { 
                    return new Promise(async (resolve, reject) => { 
                        const messageHandler = (e) => { 
                            if (e.data.request=='getTokens' && e.data.which==which && e.data.page==page && !e.data.error) { 
                                window.removeEventListener('message',messageHandler);
                                resolve(e.data.result);
                            } else if (e.data.request=='getTokens' && e.data.which==which && e.data.page==page && e.data.error) { 
                                window.removeEventListener('message',messageHandler);
                                reject(e.data.error);
                            }
                        }
                        window.addEventListener('message',messageHandler);
                        parent.postMessage({request:'getTokens', which, page}, '*');
                    });
                } else { 
                    console.error('Attempt to access tokens that haven\\'t been imported');
                }
            }
            window.cardano.nft.getUTXOs = async (which='own', page=0) => { 
                if (which=='own') {
                    which=window.cardano.nft._data.ownerAddr;
                }
                if (page==0) { 
                    return {utxos: window.cardano.nft._data.utxos[which], fetchedAt: window.cardano.nft._data.fetchedAt};
                } else if (window.cardano.nft._data.utxos[which]) { 
                    return new Promise(async (resolve, reject) => { 
                        const messageHandler = (e) => { 
                            if (e.data.request=='getUTXOs' && e.data.which==which && e.data.page==page && !e.data.error) { 
                                window.removeEventListener('message', messageHandler);
                                resolve(e.data.result);
                            } else if (e.data.request=='getUTXOs' && e.data.which==which && e.data.page==page && e.data.error) { 
                                window.removeEventListener('message', messageHandler);
                                reject(e.data.error);
                            }
                        }
                        window.addEventListener('message',messageHandler);
                        parent.postMessage({request:'getUTXOs', which, page}, '*');
                    });
                } else { 
                    console.error('Attempt to access UTXOs that haven\\'t been imported');
                }
            }
        </script>
    `;
    return ret;
}


SmartNFTPortal.propTypes = {
    style: PropTypes.object,
    random: PropTypes.number,
    loading: PropTypes.bool.isRequired,
    smartImports: PropTypes.object.isRequired,
    metadata: PropTypes.object.isRequired,
    loadingContent: PropTypes.object,
    apiRoot: PropTypes.string,
    className: PropTypes.string
  };
export default SmartNFTPortal;