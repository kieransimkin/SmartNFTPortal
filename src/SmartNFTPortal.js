
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import * as React from "react";
import { version } from  '../package.json'

const SmartNFTPortal = (props) => { 
    const {
        smartImports, 
        metadata, 
        style, 
        random, 
        inactiveHtmlStyle, 
        className, 
        onFocus, 
        onBlur, 
        onMouseOut, 
        onLink,
        onMouseOver,
        onClick, onMouseDown, onMouseUp, onMouseMove,onContextMenu,onDblClick,onTouchStart,onTouchEnd,onTouchMove,onTouchCancel, onReady, onScroll
    } = props;
    let loading = props.loading;
    if (!smartImports || !metadata || Object.keys(metadata).length === 0 || Object.keys(smartImports).length===0) loading=true;
    let loadingContent = props.loadingContent;
    const iFrameRef = useRef();
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
    
    let src='';
    let librariesHTML ='';
    const doFocus = () => { 
        if (document.activeElement === iFrameRef.current) {
            if (!iFrameRef.current) return; // user browsed away
            iFrameRef.current.contentWindow.postMessage({request: 'focus'},'*');   
            if (onFocus) {
                onFocus();
            }
        }
    }
    const doBlur = () => {
        if (document.activeElement !== iFrameRef.current) {
            if (!iFrameRef.current) return; // user browsed away
            iFrameRef.current.contentWindow.postMessage({request: 'blur'},'*');   
            if (onBlur) { 
                onBlur();
            }
        }
    }
    const doMouseover = () => { 
        if (onMouseOver) { 
            onMouseOver();
        }
    }
    const doMouseout = () => { 
        if (onMouseOut) { 
            onMouseOut();
        }
    }

    const base64ToUnicode = (str) => { 
        return decodeURIComponent(
            atob(str)
                .split('')
                .map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                })
                .join('')
        )
    }
    function unicodeToBase64(str) {
        // First we use encodeURIComponent to get percent-encoded UTF-8,
        // then we convert the percent encodings into raw bytes which
        // can be fed into btoa.
        return btoa(
          encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1)
          })
        )
    }
    const dataURItoString = (dataURI) => {
        var byteString = '';
        if (dataURI.split(',')[0].includes('base64')) { 
            byteString = base64ToUnicode(dataURI.split(',')[1]);
        } else { 
            byteString = decodeURIComponent(dataURI.split(',')[1]);
        }
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0] // Not needed but extracted anyway
        return byteString;
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
            case 'getFileObject':
                return onGetFileObject(e);
            case 'getTransactions':
                return onGetTransactions(e);
            case 'getTokens':
                return onGetTokens(e);
            case 'getUTXOs': 
                return onGetUTXOs(e);
            case 'getMetadata':
                return onGetMetadata(e);
            case 'escape':
                if (!iFrameRef.current) return; // user browsed away
                iFrameRef.current.contentWindow.postMessage({request: 'blur'},'*'); 
                if (onBlur) { 
                    onBlur(e);
                }
                return;
            case 'ready':
                if (onReady) return onReady();
                return;
            case 'click':
                if (onClick) return onClick(e.data.event);
                return;
            case 'mouseDown':
                if (onMouseDown) return onMouseDown(e.data.event);
                return;
            case 'mouseUp':
                if (onMouseUp) return onMouseUp(e.data.event);
                return;
            case 'mouseMove':
                if (onMouseMove) return onMouseMove(e.data.event);
                return;
            case 'contextMenu':
                if (onContextMenu) return onContextMenu(e.data.event);
                return;
            case 'dblClick':
                if (onDblClick) return onDblClick(e.data.event);
                return;
            case 'touchStart':
                if (onTouchStart) return onTouchStart(e.data.event);
                return;
            case 'touchEnd':
                if (onTouchEnd) return onTouchEnd(e.data.event);
                return;
            case 'touchMove':
                if (onTouchMove) return onTouchMove(e.data.event);
                return;
            case 'touchCancel':
                if (onTouchCancel) return onTouchCancel(e.data.event);
                return;
            case 'scroll':
                if (onScroll) return onScroll(e.data.event);
                return;
            case 'link': 
                if (onLink) { return onLink(e.data.url,e.data.event) } else {
                    iFrameRef.current=(<iframe src={e.data.url}></iframe>)
                    //iFrameRef.current.src=e.data.url;
                }
                return;
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
                            mediaType: img.headers.get("Content-Type"),
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
                            mediaType: img.headers.get("Content-Type"),
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
                            mediaType: res.headers.get("Content-Type"),
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
    const onGetFileObject = (e) => { 
        postData('/getFileObject',{unit: e.data.unit, id: e.data.id, metadata: e.data.metadata}).then((res) => {
            if (res.status == 200) {
                res.json().then(result => {      
                    if (!iFrameRef.current) return; // user browsed away
                    iFrameRef.current.contentWindow.postMessage({
                        request: 'getFileObject',
                        id: e.data.id,
                        unit: e.data.unit,
                        result
                    },'*')
                });
            } else { 
                if (!iFrameRef.current) return; // user browsed away
                iFrameRef.current.contentWindow.postMessage({
                    request: 'getFileObject',
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
            librariesHTML+='<script src="'+smartImports.libraries[c]+'"><'; // the weird break here is to work around a bug with inline javascript in webpack that breaks when it sees the  close script tag
            librariesHTML+='/script>\n';
        }
    }
    librariesHTML+=getPortalAPIScripts(smartImports, metadata, props);
    if (metadata && metadata.files && metadata.files[0]) { 
        let newSrc = metadata.files[0].src; // Todo - this line and the line above assume that the text/html program code will be the first element in the files array
        if (Array.isArray(newSrc)) { 
            newSrc = newSrc.join('');
        }
        let blob = dataURItoString(newSrc); 
        blob = '<html data-id="'+random+'" style="'+inactiveHtmlStyle+'"><head><meta charset=utf-8>'+librariesHTML+'</head><body style="background-color: transparent; padding: 0; margin: 0px; min-width: 100%; min-height: 100%;"}><input style="z-index:0;width:0px;position:absolute;opacity:0" id="focusTarget" />'+blob+'</body></html>';
        src='data:text/html;charset=utf-8;base64,'+unicodeToBase64(blob)
    }
    useEffect(() => {
        window.addEventListener("message", onMessage);
        window.addEventListener('blur', doFocus);
        window.addEventListener('focus', doBlur);
        if (iFrameRef.current) { 
            iFrameRef.current.addEventListener('mouseover', doMouseover);
            iFrameRef.current.addEventListener('mouseout', doMouseout);
        }
        return () => { 
            window.removeEventListener("message",onMessage)
            window.removeEventListener('blur',doFocus);
            window.removeEventListener('focus',doBlur);
            if (iFrameRef.current) { 
                iFrameRef.current.removeEventListener('mouseover', doMouseover);
                iFrameRef.current.removeEventListener('mouseout', doMouseout);
            }
        }
    }, []);
    if (loading) { 
        return loadingContent;
    }
    // Here the actual iframe that does all the work:
    return (
        <iframe ref={iFrameRef} style={style} className={className} sandbox="allow-scripts" src={src} />
    );
}

// This is the API that's provided to the child iframe:
const getPortalAPIScripts = (smartImports, metadata, props) => { 
    const  {onClick, onMouseDown, onMouseUp, onMouseMove,onContextMenu,onDblClick,onTouchStart,onTouchEnd,onTouchMove,onTouchCancel, activeHtmlStyle, inactiveHtmlStyle,focus, onScroll} = props;
    let ret="<script>\n";
    ret+="if (!window.cardano) window.cardano={};\n";
    ret+="if (!window.cardano.nft) window.cardano.nft={};\n";
    ret+="if (!window.cardano.nft._data) window.cardano.nft._data={};\n";
    ret+="window.cardano.nft._data.portalVersion="+JSON.stringify(version)+";\n";
    ret+="window.cardano.nft._data.libcip54Version="+JSON.stringify(smartImports?.libcip54Version)+";\n";
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
    if (smartImports?.files) { 
        ret+='window.cardano.nft._data.files='+JSON.stringify(smartImports.files)+";\n";
    }
    ret+="if(document.readyState!=='loading') {\n";
    if (focus) { 
        ret+="  document.getElementById('focusTarget').focus();\n";
    }
    ret+="  parent.postMessage({request:'ready'},'*');\n";
    ret+="} else {\n";
    ret+="  document.addEventListener('DOMContentLoaded', () => {\n";
    if (focus) { 
        ret+="      document.getElementById('focusTarget').focus();\n";
    }
    ret+="      parent.postMessage({request:'ready'},'*');\n";
    ret+="  });\n";
    ret+="}\n";
    ret+='<'; // Again we put a linebreak here to work around webpack's weird handling of inline scripts
    ret+='/script>';

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
        window.cardano.nft.getFileObject = async (id=null, unit=null) => { 
            console.error('Attempt to use getFileObject without importing files API');
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
                        resolve(new Blob([e.data.buffer], {type: e.data.mediaType}));
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
            return URL.createObjectURL(await window.cardano.nft.getTokenThumb(unit));
        }
        window.cardano.nft.getTokenImage = async (unit) => { 
            return new Promise(async (resolve, reject) => { 
                const messageHandler = (e) => { 
                    if (e.data.request=='getTokenImage' && e.data.unit == unit && !e.data.error) { 
                        window.removeEventListener('message',messageHandler);
                        resolve(new Blob([e.data.buffer], {type: e.data.mediaType}));
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
            return URL.createObjectURL(await window.cardano.nft.getTokenImage(unit));
        }
        window.cardano.nft.getFile = async (id=null, unit='own') => { 
            return new Promise(async (resolve, reject) => { 
                if (window.cardano.nft._data.files[unit=='own'?window.cardano.nft._data.tokenUnit:unit]) { 
                    for (const file of window.cardano.nft._data.files[unit=='own'?window.cardano.nft._data.tokenUnit:unit]) { 
                        if (file?.id && file?.id==id) { 
                            const res = await fetch(file?.src);
                            return resolve(await res.blob());
                        }
                    }
                }
                const messageHandler = (e) => { 
                    if (e.data.request=='getFile' && e.data.id == id && e.data.unit == unit && !e.data.error) { 
                        window.removeEventListener('message',messageHandler);
                        resolve(new Blob([e.data.buffer], {type: e.data.mediaType}));
                    } else if (e.data.request=='getFile' && e.data.id == id && e.data.unit == unit && e.data.error) { 
                        window.removeEventListener('message',messageHandler);
                        reject(e.data.error);
                    }
                }
                window.addEventListener('message',messageHandler);
                parent.postMessage({request:'getFile',id,unit, metadata:window.cardano.nft._data.metadata},'*');
            
            });
        }
        window.cardano.nft.getFileObject = async (id=null, unit='own') => { 
            return new Promise(async (resolve, reject) => { 
                if (window.cardano.nft._data.files[unit=='own'?window.cardano.nft._data.tokenUnit:unit]) { 
                    for (const file of window.cardano.nft._data.files[unit=='own'?window.cardano.nft._data.tokenUnit:unit]) { 
                        if (file?.id && file?.id==id) { 
                            if (file?.props) {
                                for (const prop in file.props) { 
                                    if (prop==='src') continue;
                                    file[prop]=file.props[prop];
                                }
                                delete file.props;
                            }
                            return resolve(file);
                        }
                    }
                }
                const messageHandler = (e) => { 
                    if (e.data.request=='getFileObject' && e.data.id == id && e.data.unit == unit && !e.data.error) { 
                        window.removeEventListener('message',messageHandler);
                        const result = {...e.data.result};
                        for (const prop in result?.props) { 
                            if (prop==='src') continue;
                            result[prop]=result.props[prop];
                        }
                        delete result.props;
                        resolve(result);
                    } else if (e.data.request=='getFileObject' && e.data.id == id && e.data.unit == unit && e.data.error) { 
                        window.removeEventListener('message',messageHandler);
                        reject(e.data.error);
                    }
                }
                window.addEventListener('message',messageHandler);
                parent.postMessage({request:'getFileObject',id,unit, metadata:window.cardano.nft._data.metadata},'*');
            });
        }
        window.cardano.nft.getFileUrl = async (id=null, unit='own') => { 
            return new Promise(async (resolve, reject) => { 
                if (window.cardano.nft._data.files[unit=='own'?window.cardano.nft._data.tokenUnit:unit]) { 
                    for (const file of window.cardano.nft._data.files[unit=='own'?window.cardano.nft._data.tokenUnit:unit]) { 
                        if (file?.id && file?.id==id) {
                            return resolve(file?.src);
                        }
                    }
                }
                resolve(URL.createObjectURL(await window.cardano.nft.getFile(id, unit)))
            });
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
            window.addEventListener('keyup',(e) => { 
                if (e.key==="Escape") { 
                    parent.postMessage({request:'escape'},'*');
                }
            });
            const focusBlurHandler = (e) => { 
                if (e.data.request=='focus' && !e.data.error) { 
                    document.querySelector('html').style=${JSON.stringify(activeHtmlStyle||'')};
                } else if (e.data.request=='blur' && !e.data.error) { 
                    document.querySelector('html').style=${JSON.stringify(inactiveHtmlStyle||'')};
                }
            }
            window.addEventListener('message',focusBlurHandler);
            ${onClick ? `window.addEventListener('click',(e) => { 
                parent.postMessage({request:'click',event:JSON.stringify(e)},'*');
            });
            `:''}
            ${onMouseDown ? `window.addEventListener('mousedown',(e) => { 
                parent.postMessage({request:'mouseDown',event:JSON.stringify(e)},'*');
            });
            `:''}
            ${onMouseUp ? `window.addEventListener('mouseup',(e) => { 
                parent.postMessage({request:'mouseUp',event:JSON.stringify(e)},'*');
            });
            `:''}
            ${onMouseMove ? `window.addEventListener('mousemove',(e) => { 
                parent.postMessage({request:'mouseMove',event:JSON.stringify(e)},'*');
            });
            `:''}
            ${onContextMenu ? `window.addEventListener('contextmenu',(e) => { 
                parent.postMessage({request:'contextMenu',event:JSON.stringify(e)},'*');
            });
            `:''}
            ${onDblClick ? `window.addEventListener('dblclick',(e) => { 
                parent.postMessage({request:'dblClick',event:JSON.stringify(e)},'*');
            });
            `:''}
            ${onTouchStart ? `window.addEventListener('touchstart',(e) => { 
                parent.postMessage({request:'touchStart',event:JSON.stringify(e)},'*');
            });
            `:''}
            ${onTouchEnd ? `window.addEventListener('touchend',(e) => { 
                parent.postMessage({request:'touchEnd',event:JSON.stringify(e)},'*');
            });
            `:''}
            ${onTouchMove ? `window.addEventListener('touchmove',(e) => { 
                parent.postMessage({request:'touchMove',event:JSON.stringify(e)},'*');
            });
            `:''}
            ${onTouchCancel ? `window.addEventListener('touchcancel',(e) => { 
                parent.postMessage({request:'touchCancel',event:JSON.stringify(e)},'*');
            });
            `:''}
            ${onScroll ? `document.addEventListener('wheel',(e) => { 
                parent.postMessage({request:'scroll',event:JSON.stringify(e)},'*');
            });
            `:''}
            window.cardano.nft.linkTo = async(url,event) => { 
                parent.postMessage({request:'link', url, event},'*');
            }
            window.cardano.nft.getOwner = async () => { 
                return window.cardano.nft._data.ownerAddr;
            }
            window.cardano.nft.getPortalVersion = async () => { 
                return window.cardano.nft._data.portalVersion;
            }
            window.cardano.nft.getLibcip54Version = async() => { 
                return window.cardano.nft._data.libcip54Version;
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
                    return {transactions: window.cardano.nft._data.transactions[which]||[], fetchedAt: window.cardano.nft._data.fetchedAt};
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
                    return {tokens: window.cardano.nft._data.tokens[which]||[], fetchedAt: window.cardano.nft._data.fetchedAt};
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
                    return {utxos: window.cardano.nft._data.utxos[which]||[], fetchedAt: window.cardano.nft._data.fetchedAt};
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
        <`;
    ret+='/script>\n'; // Again we workaround the webpack bug
    return ret;
}

SmartNFTPortal.propTypes = {
    style: PropTypes.object,
    random: PropTypes.number,
    inactiveHtmlStyle: PropTypes.string,
    activeHtmlStyle: PropTypes.string,
    onReady:PropTypes.func,
    onScroll:PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    onClick:PropTypes.func,
    onMouseDown:PropTypes.func,
    onLink:PropTypes.func,
    onMouseUp:PropTypes.func,
    onMouseMove:PropTypes.func,
    onContextMenu:PropTypes.func,
    onDblClick:PropTypes.func,
    onTouchStart:PropTypes.func,
    onTouchEnd:PropTypes.func,
    onTouchMove:PropTypes.func,
    onTouchCancel:PropTypes.func,
    loading: PropTypes.bool.isRequired,
    smartImports: PropTypes.object.isRequired,
    metadata: PropTypes.object.isRequired,
    loadingContent: PropTypes.object,
    apiRoot: PropTypes.string,
    className: PropTypes.string,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    focus:PropTypes.bool
  };
export default SmartNFTPortal;