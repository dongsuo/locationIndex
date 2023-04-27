let CENTER_LOCATION = {
    lat: undefined, // 纬度
    lng: undefined // 经度
}
let CENTER_MARKER = null
let STARBUCK_INDEX = undefined
let RANGE_DIS = 2000
let MARKER_LIST = []

const map = new AMap.Map('container', {
    zoom:15,
    showLabel: true, //不显示地图文字标记
    features: [ 'bg','road', 'building', 'point']
});

let toast
AMap.plugin([
    'AMap.ToolBar',
    'AMap.Scale',
    'AMap.OverView',
    'AMap.MapType',
    'AMap.Geolocation',
    'AMap.Autocomplete',
    'AMap.AdvancedInfoWindow'
], () => {
    // 在图面添加工具条控件，工具条控件集成了缩放、平移、定位等功能按钮在内的组合控件
    map.addControl(new AMap.ToolBar());

    // 在图面添加比例尺控件，展示地图在当前层级和纬度下的比例尺
    map.addControl(new AMap.Scale());

    var auto = new AMap.Autocomplete({
        input: "tipinput"
    });
    auto.on('select', (resp) => {
        CENTER_LOCATION.formattedAddress = `${resp.poi.district}${resp.poi.address}${resp.poi.name}`
        CENTER_LOCATION.lng = resp.poi.location.lng
        CENTER_LOCATION.lat = resp.poi.location.lat
        setMarker()
    })

    // 在图面添加定位控件，用来获取和展示用户主机所在的经纬度位置
    const geolocation = new AMap.Geolocation({
        enableHighAccuracy: true
    })
    map.addControl(geolocation);
    geolocation.getCurrentPosition((status,result) => {
        if(status === 'complete'){
            CENTER_LOCATION.formattedAddress = result.formattedAddress
            CENTER_LOCATION.lng = result.position.lng
            CENTER_LOCATION.lat = result.position.lat
            setMarker()
        } else {
            alert('位置获取失败，请手动搜索位置！')
        }
    })
})

function setMarker() {
    CENTER_MARKER && map.remove(CENTER_MARKER)
    CENTER_MARKER = new AMap.Marker({
        position: new AMap.LngLat(CENTER_LOCATION.lng || 121.43, CENTER_LOCATION.lat || 31.19),   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
    })
    map.setCenter([CENTER_LOCATION.lng, CENTER_LOCATION.lat])
    map.add(CENTER_MARKER)
    loadStarbuck(CENTER_LOCATION, RANGE_DIS).then(starBucks => {
        STARBUCK_INDEX = starBucks.length
        MARKER_LIST.forEach(oldMarker => {
            map.remove(oldMarker)
        })
        MARKER_LIST = starBucks
        starBucks.forEach(marker => {
            map.add(marker)
        })
        map.setFitView()
        onComplete()
    })
}

document.getElementById('rangeBtn').addEventListener('click', handleReRange)

document.getElementById('rangeInput').addEventListener('keyup',e => {
    if(e.keyCode === 13) {
        handleReRange()
    }
})
function handleReRange() {
    const km = document.getElementById('rangeInput').value || 2
    if(km > 100) {
        alert('指数范围请不要超过100公里，这个范围已经没有意义了')
        return
    }else {
        RANGE_DIS = km * 1000
        setMarker()
    }
}
function loadStarbuck(location, range) {
    let icon = new AMap.Icon({
        size: new AMap.Size(30, 30),    // 图标尺寸
        image: './icon.png',  // Icon的图像
        imageSize: new AMap.Size(30, 30)   // 根据所设置的大小拉伸或压缩图片
    })
    return new Promise((resolve,reject) => {
        fetch(`./nearby?lat=${location.lat}&lon=${location.lng}&limit=2000&locale=ZH&features=&radius=${range}`).then(resp => {
            return resp.json()
        }).then(function(json) {
            resolve(json.data.map((item,index) => {
                return new AMap.Marker({
                    icon,
                    position: new AMap.LngLat(item.coordinates.longitude,item.coordinates.latitude),   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                    title: '北京'
                });
                
            }))
          }).catch(() => {
              alert('星巴克数据获取失败！')
          })
    })
}

function onComplete() {
    document.getElementById('status').innerHTML=`定位成功`
    var str = [];
    str.push(`当前位置：${CENTER_LOCATION.formattedAddress}`)
    str.push(`指数半径：${RANGE_DIS/1000}公里`)
    str.push('星巴克指数：' + STARBUCK_INDEX);
    document.getElementById('result').innerHTML = str.join('<br>');
}