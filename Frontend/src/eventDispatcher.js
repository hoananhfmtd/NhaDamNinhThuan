import { detect } from 'detect-browser';
import { API_URI, callAPI } from './api';
const browser = detect();

let client = 'web',
    clientId = localStorage.getItem('clientId'),
    deviceInfo = `Trình duyệt: ${browser.name}, Trên ${browser.os}, Phiên bản: ${browser.version}`,
    ip;

const getIPAddress = async () => {
    try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ip = ipData.ip;
    } catch (error) {}
};


const createEvent = async ({
    path = '',
    method = '',
    description = '',
    bieuMau = '',
    isUpdate = false,
    updateId = '',
    isImport = false,
    isSyncthetic = false
}) => {
    let eventType,
        _bieuMau = bieuMau,
        bieuMauId,
        shouldSendRequest = true;
    // http://localhost:5800/api/nghiepvukk/bieumauso6s
    // http://localhost:5800/api/nghiepvukk/bieumauso6s/12
    if (isImport || description) {
        if (!ip) {
            await getIPAddress();
        }
        await callAPI({
            method: 'POST',
            path: API_URI + 'create-event',
            data: {
                client,
                clientId,
                deviceInfo,
                ip,
                bieuMau: _bieuMau,
                bieuMauId,
                eventType: "import_excel",
                description,
            },
        });
        return;
    }
    // ['http://localhost:5800/api/', 'bieumauso1s-list'] => 'bieumauso1s-list'
    const splitPath = path.split('nghiepvukk/')[1];
    if (!splitPath?.includes("bieumauso") || splitPath?.includes("list")) return;
    // ['bieumauso1s/12'] => '12'
    // ['bieumauso1s-delete/12'] => ['bieumauso1s-delete', '12']
    const splitPath2 = splitPath.split('/');
    _bieuMau = "BieuMauSo" + splitPath?.split("-")[0]?.replaceAll("bieumauso", "")?.replaceAll("s", "");
    bieuMauId = splitPath2?.[splitPath2?.length - 1] ?? null;

    const isCreate = splitPath.includes("-upsert");
    const isDelete = splitPath.includes("-delete");
    const isConfirm = splitPath.includes("-confirm");
    const isPublish = splitPath.includes("-publish");

    if (isCreate && !isUpdate) {
        bieuMauId = null;
        if (isSyncthetic) {
            eventType = 'syncthetic_bieu_mau';
        } else {
            eventType = 'create_bieu_mau';
        }
    } else if (isDelete) {
        eventType = 'delete_bieu_mau';
    } else if (isPublish) {
        eventType = 'publish_bieu_mau';
    } else if (isConfirm) {
        eventType = 'confirm_bieu_mau';
    } else if (description) {
        eventType = 'import_excel';
    } else if (isUpdate) {
        eventType = 'update_bieu_mau';
        bieuMauId = updateId;
    } else {
        shouldSendRequest = false;
    }
    // console.log(
    //     `IsCreate ${isCreate} IsDelete ${isDelete} IsPublish ${isPublish} IsConfirm ${isConfirm}`
    // );
    try {
        if (!shouldSendRequest) return;
        if (!ip) {
            await getIPAddress();
        }
        await callAPI({
            method: 'POST',
            path: API_URI + 'create-event',
            data: {
                client,
                clientId,
                deviceInfo,
                ip,
                bieuMau: _bieuMau,
                bieuMauId,
                eventType,
                description,
            },
        });
    } catch (error) {}
};

export default createEvent;
