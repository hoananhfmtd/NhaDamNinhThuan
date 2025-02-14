import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import React from 'react';
import Api from '../api';
import { MyButton } from '../components';
import { TinhThanhSelect } from '../kktnn-components';

function textToPoint(text) {
    let arr = text.split(",")
    if (arr.length !== 2) {
        arr = text.split(" ")
    }
    if (arr.length !== 2) {
        return undefined
    }

    const lat = Number(arr[0].trim())
    const lng = Number(arr[1].trim())
    if (isNaN(lat) || isNaN(lng)) {
        return undefined
    }

    return [lat, lng]
}

export const HelpBox = ({ open, onClose }) => {
    const [wgs84, setWGS84] = React.useState("")
    const [vn2000tw, setVN2000tw] = React.useState("")
    const [vn2000tinh, setVN2000tinh] = React.useState("")

    const [tinhThanhId, setTinhThanhId] = React.useState("")
    const [tinhThanh, setTinhThanh] = React.useState("")
    const [src, setSrc] = React.useState("")

    const getVN2000 = React.useCallback(async (src, wgs84, vn2000tw, vn2000tinh, tinhThanhId) => {
        const coordinate = { src: src };

        let valid = false;

        const pointwgs84 = textToPoint(wgs84)
        if (pointwgs84 && src === "wgs84") {
            valid = true;
            coordinate.src = "wgs84"
            coordinate.wgs84 = { lat: pointwgs84[0], lng: pointwgs84[1] }
        }

        const pointtw = textToPoint(vn2000tw)
        if (pointtw && src === "tw") {
            valid = true;
            coordinate.src = "tw"
            coordinate.tw = { x: pointtw[0], y: pointtw[1] }
        }

        const pointtinh = textToPoint(vn2000tinh)
        if (pointtinh && src === "tinh" && tinhThanhId && tinhThanhId !== "") {
            valid = true;
            coordinate.src = "tinh"
            coordinate.tinh = { x: pointtinh[0], y: pointtinh[1], matinh: tinhThanhId }
        }

        if (src !== "tinh" && tinhThanhId && tinhThanhId !== "") {
            coordinate.tinh = { matinh: tinhThanhId }
        }

        if (!valid) {
            console.log("invalid", coordinate);
        }
        console.log("valid", coordinate);

        const response = await new Api().transformGeometry(coordinate);
        if (response?.code === 200 && response?.data) {
            console.log("response?.data", response?.data);

            const { wgs84, tw, tinh } = response?.data
            switch (src) {
                case "wgs84":
                    setVN2000tw(`${tw?.x | 0} ${tw?.y | 0}`)
                    if (tinhThanhId && tinhThanhId !== "") {
                        setVN2000tinh(`${tinh?.x | 0} ${tinh?.y | 0}`)
                    }
                    break;
                case "tw":
                    setWGS84(`${wgs84?.lat} ${wgs84?.lng}`)
                    if (tinhThanhId && tinhThanhId !== "") {
                        setVN2000tinh(`${tinh?.x | 0} ${tinh?.y | 0}`)
                    }
                    break;
                case "tinh":
                    setWGS84(`${wgs84?.lat} ${wgs84?.lng}`)
                    setVN2000tw(`${tw?.x | 0} ${tw?.y | 0}`)
                    break;
                default:
                    break;
            }
        }
    }, [])

    const handleChangeWGS84 = React.useCallback(async (e) => {
        const text = e.target.value
        setWGS84(text)
        setSrc("wgs84")

        await getVN2000("wgs84", text, vn2000tw, vn2000tinh, tinhThanhId)
    }, [getVN2000, vn2000tw, vn2000tinh, tinhThanhId])

    const handleChangeVN2000tw = React.useCallback(async (e) => {
        const text = e.target.value
        setVN2000tw(text)
        setSrc("tw")

        await getVN2000("tw", wgs84, text, vn2000tinh, tinhThanhId)
    }, [getVN2000, wgs84, vn2000tinh, tinhThanhId])

    const handleChangeVN2000tinh = React.useCallback(async (e) => {
        const text = e.target.value
        setVN2000tinh(text)
        setSrc("tinh")

        await getVN2000("tinh", wgs84, vn2000tw, text, tinhThanhId)
    }, [getVN2000, wgs84, vn2000tw, tinhThanhId])

    const handleChangeTinh = React.useCallback(async (tinhThanhId, tinhThanh) => {
        setTinhThanhId(tinhThanhId)
        setTinhThanh(tinhThanh)

        await getVN2000(src, wgs84, vn2000tw, vn2000tinh, tinhThanhId)
    }, [getVN2000, src, wgs84, vn2000tw, vn2000tinh])

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="responsive-dialog-title"
            maxWidth="lg"
        >
            <DialogTitle id="responsive-dialog-title" textAlign={'center'} alignItems={'center'}>
                Chuyển đổi tọa độ VN2000, WGS84
            </DialogTitle>
            <DialogContent
                style={{
                    width: '800px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    paddingTop: 10
                }}
            >
                <TextField
                    label="VN2000 TW"
                    style={{ padding: "4.5px" }}
                    placeholder='X Y'
                    helperText='Nhập tọa độ x, y cách nhau bởi khoảng trắng hoặc dấu phẩy'
                    variant="standard"
                    value={vn2000tw}
                    onChange={(e) => handleChangeVN2000tw(e)}
                />

                <TinhThanhSelect
                    onSelect={({ tinhThanhId, tinhThanh }) => handleChangeTinh(tinhThanhId, tinhThanh)}
                    tinhThanhId={tinhThanhId}
                />
                <TextField
                    label={"VN2000 " + tinhThanh}
                    style={{ padding: "4.5px" }}
                    placeholder='X Y'
                    helperText='Nhập tọa độ x, y cách nhau bởi khoảng trắng hoặc dấu phẩy'
                    variant="standard"
                    value={vn2000tinh}
                    onChange={(e) => handleChangeVN2000tinh(e)}
                />

                <TextField
                    label="WGS84"
                    style={{ padding: "4.5px" }}
                    placeholder='latitude longitude'
                    helperText='Nhập vĩ độ, kinh độ cách nhau bởi khoảng trắng hoặc dấu phẩy'
                    variant="standard"
                    value={wgs84}
                    onChange={(e) => handleChangeWGS84(e)}
                />
            </DialogContent>
            <DialogActions>
                <MyButton txt="Đóng" onClick={onClose} variant="outlined" />
            </DialogActions>
        </Dialog>
    );
}
