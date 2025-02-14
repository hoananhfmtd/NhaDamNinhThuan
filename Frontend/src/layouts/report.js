import { yupResolver } from '@hookform/resolvers/yup';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import Api from '../api';
import { MyButton, ThongBao } from '../components';
import { UploadFiles } from '../kktnn-components';

export const Report = ({ open, onClose }) => {
    const [error, setError] = React.useState({});
    const schema = yup.object().shape({
        moTa: yup.string().required('Nội dung phản hồi là bắt buộc.'),
    });

    const initialValue = React.useMemo(() => ({
        moTa: '',
        tepDinhKems: [],
    }), []);

    const {
        setValue,
        getValues,
    } = useForm({
        mode: 'onChange',
        shouldFocusError: true,
        defaultValues: initialValue,
        resolver: yupResolver(schema),
    });

    const handleSubmit = async () => {
        const payload = getValues();
        console.log(payload);
        // Gửi payload lên server ở đây
        if (payload.moTa === '') {
            ThongBao({ status: 'error', message: 'Vui lòng nhập nội dung phản hồi!' });
            setError({ moTa: 'Nội dung phản hồi là bắt buộc!' });
            return;
        }
        if (payload.tepDinhKems.length === 0) {
            ThongBao({ status: 'error', message: 'Vui lòng nhập file đính kèm!' });
            setError({ tepDinhKems: 'File đính kèm là bắt buộc!' });
            return;
        }
        try {
            await new Api()
                .upsertFeedback({ data: payload })
                .then((res) => {
                    if (res.code === 200) {
                        ThongBao({ status: 'success', message: 'Gửi phản hồi thành công!' });
                        onClose()
                        setValue('moTa', '');
                        setValue('tepDinhKems', []);
                        setError({});
                    }
                })
                .catch((error) => {
                    ThongBao({ status: 'error', message: 'Gửi phản hồi thất bại!' });
                    console.log(error);
                });
        } catch (error) {
            ThongBao({ status: 'error', message: 'Gửi phản hồi thất bại!' });
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="responsive-dialog-title"
            maxWidth="xl"
        >
            <DialogTitle
                id="responsive-dialog-title"
                textAlign="center"
                sx={{
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'bold',
                    color: '#333',
                    paddingBottom: 0
                }}
            >
                Gửi phản hồi và góp ý cho chúng tôi
            </DialogTitle>
            <DialogContent
                sx={{
                    width: '800px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    paddingTop: 2,
                    paddingBottom: 2,
                    paddingLeft: 3,
                    paddingRight: 3
                }}
            >
                <p style={{ color: 'black', fontWeight: 'bold' }}>1. Nội dung phản hồi <span style={{ color: 'red' }}> *</span></p>
                <p style={{ fontStyle: 'italic', fontSize: 15 }}><ErrorOutlineIcon /> Mô tả chi tiết các bước dẫn tới lỗi mà bạn gặp phải.</p>
                <TextField
                    id="moTa-textarea"
                    multiline
                    rows={6}
                    variant="outlined"
                    placeholder="Vui lòng nhập phản hồi của bạn tại đây..."
                    fullWidth
                    required
                    helperText={error.moTa}
                    FormHelperTextProps={{
                        style: {
                            color: !error.moTa
                                ? '#4CAF50'
                                : 'red',
                        },
                    }}
                    sx={{
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '16px',
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: '#ccc',
                            },
                            '&:hover fieldset': {
                                borderColor: !error.moTa ? '#22c55e' : "red",
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: !error.moTa ? '#22c55e' : "red",
                            },
                        },
                    }}
                    onChange={(e) => {
                        setValue('moTa', e.target.value);
                        if (e.target.value === '') {
                            setError({ moTa: 'Nội dung phản hồi là bắt buộc!' });
                        } else {
                            setError({ moTa: '' });
                        }
                    }}
                />
                <p style={{ color: 'black', fontWeight: 'bold' }}>2. File đính kèm<span style={{ color: 'red' }}> *</span></p>
                <p style={{ fontStyle: 'italic', fontSize: 15 }}><ErrorOutlineIcon /> Mô tả chi tiết lỗi của bạn gặp phải bằng hình ảnh.</p>
                <UploadFiles
                    keyIndex={2223}
                    initialValues={getValues('tepDinhKems')}
                    onChange={(e) => {
                        setValue('tepDinhKems', e, '1');
                    }}  // Use the new handleFilesChange function
                />
                {error.tepDinhKems && <span style={{ color: 'red', fontSize: '12px' }}>{error.tepDinhKems}</span>}
            </DialogContent>
            <DialogActions>
                <MyButton txt="Đóng" onClick={onClose} variant='outlined' />
                <MyButton txt="Gửi phản hồi" onClick={handleSubmit} color="primary" />
            </DialogActions>
        </Dialog>
    );
}
