"use client"

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Form from './components/form';

import Button from '@mui/material/Button';
import { CREATE, DELETE, UPDATE } from '@/actions/pricing';
import { Customer, Delegate, Image as ImageType, Input, Pricing, User } from '@prisma/client';
import Skeleton from '@mui/material/Skeleton';

import { useDebounce } from "@/lib/use-debounce";
import DeleteBTN from './components/delete';
import { useReactToPrint } from 'react-to-print';
import { PanoramaFishEyeRounded, Preview, VisibilityRounded } from '@mui/icons-material';
import convertTextToEquation from '../../../../lib/convert-text-to-equation';
import { AppContextProps, SiteContext } from '@/hooks/site-context';
import Image from 'next/image';


interface PricingWithUserAndCustomer extends Partial<Pricing> {
    user: Partial<User>;
    customer: Partial<Customer>;
    input: Partial<Input>;
    delegate: Partial<Delegate>;
}

interface HeadCell {
    id: string;
    label: string;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (
    a: { [key in Key]: number | string },
    b: { [key in Key]: number | string },
) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
    height: 40,
}));

const headCells: readonly HeadCell[] = [
    { id: 'code', label: 'Code' },
    { id: 'customer', label: 'Customer' },
    { id: 'input', label: 'Delegate' },
    { id: 'total', label: 'Total' },
    { id: 'createdAt', label: 'Date' },
    { id: 'actions', label: '' },
];

const StyledTableSortLabel = styled(TableSortLabel)(({ theme }) => ({
    '&.MuiTableSortLabel-root': {
        color: 'white',
    },
    '&.MuiTableSortLabel-active': {
        color: 'white',
    },
    '&.MuiTableSortLabel-icon': {
        color: 'white',
    },
}));

export default function CustomizedTables() {
    const [page, setPage] = React.useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
    const [search, setSearch] = React.useState<string>("");
    const [rows, setRows] = React.useState<PricingWithUserAndCustomer[] | []>([]);
    const [open, setOpen] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(true);
    const [order, setOrder] = React.useState<Order>('desc');
    const [orderBy, setOrderBy] = React.useState<keyof PricingWithUserAndCustomer>('createdAt');

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof PricingWithUserAndCustomer,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedId("");
    };

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'n') {
                handleClickOpen();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const debouncedSearch = useDebounce(search, 500);

    React.useEffect(() => {
        const fetchPricing = async () => {
            setLoading(true);
            const response = await fetch(`/api/data/pricing?filterByName=${debouncedSearch}&page=${page + 1}&limit=${rowsPerPage}&sorting=${orderBy}&order=${order}`);
            if (response.ok) {
                const data = await response.json();
                setRows(data.pricings);
            }

            setLoading(false);
        }

        fetchPricing();
    }, [debouncedSearch, page, rowsPerPage, orderBy, order]);


    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = (searchedVal: string) => {
        setSearch(searchedVal);
    };

    const handleDelete = async (id: string) => {
        await DELETE(id).then((res) => {
            const updatedRows = rows.filter((row) => row.id !== res);
            setRows(updatedRows as PricingWithUserAndCustomer[]);
        }).catch((err) => {
            console.log(err);
        });
    };

    const handleCreate = async (data: any) => {
        const result = await CREATE(data);
        if ('error' in result) {
            throw new Error(result.error.message);
        } else {
            setRows((prev) => [...prev, result as PricingWithUserAndCustomer]);
        }
        return result;
    };

    const handleUpdate = async (data: any) => {
        const result = await UPDATE(data);
        if ('error' in result) {
            throw new Error(result.error.message);
        } else {
            const updatedRows = rows.map((row) => {
                if (row.id === result.id) {
                    return result as PricingWithUserAndCustomer;
                }
                return row;
            });
            setRows(updatedRows);
        }
    };

    const handleEdit = (id: string) => {
        setSelectedId(id);
        handleClickOpen();
    };

    const PreviewBtn = ({ rows, code }: { rows: PricingWithUserAndCustomer[], code: string }) => {
        const contentToPrint = React.useRef(null);
        const handlePrint = useReactToPrint({
            content: () => contentToPrint.current,
        });

        const total = rows.filter((row) => row.code === code).reduce((acc, row) => acc + (row.total || 0), 0).toFixed(2);
        const totalCost = rows.filter((row) => row.code === code).reduce((acc, row) => acc + (row.totalCost || 0), 0).toFixed(2);
        const totalAmountIncludingProfit = rows.filter((row) => row.code === code).reduce((acc, row) => acc + ((row.total as number) + ((row.total as number) * (row.profit as number) || 0) / 100), 0).toFixed(2);
        const totalTaxAmount = rows.filter((row) => row.code === code).reduce((acc, row) => acc + (((row.totalCost as number) - (row.total as number)) || 0), 0).toFixed(2);
        const totalDiscount = rows.filter((row) => row.code === code).reduce((acc, row) => acc + (row.discount || 0), 0).toFixed(2);
        const profit = rows.filter((row) => row.code === code).reduce((acc, row) => acc + ((row.total as number) * (row.profit as number) / 100), 0).toFixed(2);

        const currentRow = rows.find((row) => row.code === code);

        return (
            <>
                <Button variant="outlined" onClick={handlePrint} sx={{ padding: 0, minWidth: 0, minHeight: 0, border: "none", backgroundColor: "transparent" }}>
                    <VisibilityRounded />
                </Button>
                <div style={{ display: "none" }}>
                    <div ref={contentToPrint}>
                        {currentRow && (
                            <div style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "11px" }}>
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "end" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "end" }}>
                                        <h1 style={{ fontWeight: 600 }}>تسعيرة</h1>
                                        <p style={{ fontWeight: 600 }}>{currentRow.code} :رقم التسعير</p>
                                        <p>{currentRow.customer?.companyName}</p>
                                        <p>{currentRow.customer?.vatNumber} :الرقم الضريبي</p>
                                        <p>{new Date(currentRow.createdAt as Date).toLocaleDateString()} :التاريخ المقدر</p>
                                    </div>
                                </div>
                                <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#f3f4f6" }}>
                                    <tbody>
                                        {rows.filter((row) => row.code === code).map((input) => (
                                            <>
                                                <tr style={{ backgroundColor: "#fff" }}>
                                                    <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={9}>
                                                        <h2 style={{ fontWeight: 600, textAlign: "left", fontSize: "1.2rem" }}>═ {input.description}</h2>
                                                    </td>
                                                </tr>
                                                <tr style={{ backgroundColor: "#1f2937", color: "white" }}>
                                                    <td style={{ border: "1px solid white", textAlign: "left" }} colSpan={4}>
                                                        Customer Name
                                                    </td>
                                                    <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                        Quantity
                                                    </td>
                                                    <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                        CODE
                                                    </td>
                                                    <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={3}>
                                                        Phone
                                                    </td>
                                                </tr>
                                                <tr style={{ backgroundColor: "#f3f4f6" }}>
                                                    <td style={{ border: "1px solid white", textAlign: "left" }} colSpan={4}>
                                                        {input.customer?.companyName || ""}
                                                    </td>
                                                    <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                        {(input.structure as any)?.sheetsQuantity}
                                                    </td>
                                                    <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                        {input.customer?.code}
                                                    </td>
                                                    <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={3}>
                                                        {input.customer?.phone1}
                                                    </td>
                                                </tr>
                                                <tr style={{ color: "white", backgroundColor: "#f3f4f6", fontWeight: 600 }}>
                                                    <td style={{ backgroundColor: "#1f2937", border: "1px solid white", textAlign: "left" }} colSpan={1}>
                                                        Job Description
                                                    </td>
                                                </tr>
                                                <tr style={{ backgroundColor: "#686868", color: "white" }}>
                                                    <td style={{ border: "1px solid white", textAlign: "left" }}>
                                                        Name
                                                    </td>
                                                    <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                        Width
                                                    </td>
                                                    <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                        Height
                                                    </td>
                                                    <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                        Length
                                                    </td>
                                                    <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={4} />
                                                    <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                        Total Size
                                                    </td>
                                                </tr>
                                                {(input?.structure as any)?.input?.structure?.peices.map((add: any) => {
                                                    const width = convertTextToEquation(add.equation.width, (input?.structure as any)?.input, add.id);
                                                    const height = convertTextToEquation(add.equation.height, (input?.structure as any)?.input, add.id);
                                                    return (
                                                        <tr style={{ backgroundColor: "#f3f4f6" }} key={add.id}>
                                                            <td style={{ border: "1px solid white", textAlign: "left" }}>
                                                                <p>{add.name}</p>
                                                            </td>
                                                            <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                {add?.fields?.find((add: any) => add.name.toLowerCase() === "width")?.value}
                                                            </td>
                                                            <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                {add?.fields?.find((add: any) => add.name.toLowerCase() === "height")?.value}
                                                            </td>
                                                            <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                {add?.fields?.find((add: any) => add.name.toLowerCase() === "length")?.value}
                                                            </td>
                                                            <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={4} />
                                                            <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                {`${width} x ${height} mm`}
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                                {(input?.structure as any)?.additional?.map((add: any) => {
                                                    const printSizeOptions = [{ id: 1, name: "100x70", value: 1 }, { id: 2, name: "50x70", value: 2 }, { id: 3, name: "50x35", value: 4 }];

                                                    return (
                                                        <>
                                                            <tr style={{ backgroundColor: "#1f2937", color: "white" }} key={add.id}>
                                                                <td style={{ border: "1px solid white", textAlign: "left", fontWeight: 600 }}>
                                                                    <p>{add.name}</p>
                                                                </td>
                                                            </tr>
                                                            {add?.code === 1 && (
                                                                <>
                                                                    <tr style={{ backgroundColor: "#686868", color: "white" }}>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>QUANTITY</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>UPS</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>SHEET</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>DESTROY</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>MATERIAL</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>TYPE</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>THICKNESS</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>SIZE</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>TOTAL</p>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.quantity}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.upsInSheet}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.sheetsQuantity}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.destroyRate}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.material?.materialCategory}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.material?.materialType}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.material?.thickness}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.material?.size}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.totalCost}</p>
                                                                        </td>
                                                                    </tr>
                                                                </>
                                                            )}
                                                            {add?.code === 2 && (
                                                                <>
                                                                    <tr style={{ backgroundColor: "#686868", color: "white" }}>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>SIDE</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>COLOR TYPE</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>PRINT QU</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>SIZE</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={4} />
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>TOTAL</p>
                                                                        </td>
                                                                    </tr>
                                                                    {add?.structure?.faces?.filter((face: any) => face.active).map((face: any) => {
                                                                        return (
                                                                            <tr key={face.id}>
                                                                                <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                                    <p>{face.name}</p>
                                                                                </td>
                                                                                <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                                    <p>{face.colorType}</p>
                                                                                </td>
                                                                                <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                                    <p>{add?.structure?.quantity}</p>
                                                                                </td>
                                                                                <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                                    <p>{printSizeOptions.find((size) => size.id === add?.structure?.printSize)?.name}</p>
                                                                                </td>
                                                                                <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={4} />
                                                                                <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                                    <p>{face.totalCost}</p>
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    })}
                                                                </>
                                                            )}
                                                            {add?.code === 3 && (
                                                                <>
                                                                    <tr style={{ backgroundColor: "#686868", color: "white" }}>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>SIZE</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>PRINT SIZE</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>COLOR</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>QUANTITY</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={4} />
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>TOTAL</p>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{printSizeOptions.find((size) => size.id === add?.structure?.paperSize)?.name}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.printSize}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.numberOfColor}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.quantity}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={4} />
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.totalCost}</p>
                                                                        </td>
                                                                    </tr>
                                                                </>
                                                            )}
                                                            {add?.code === 4 && (
                                                                <>
                                                                    <tr style={{ backgroundColor: "#686868", color: "white" }}>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>SIZE</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>PRINT SIZE</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>COLOR</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>QUANTITY</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={4} />
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>TOTAL</p>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{printSizeOptions.find((size) => size.id === add?.structure?.paperSize)?.name}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.embossingSize}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.numberOfColor}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.quantity}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={4} />
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.totalCost}</p>
                                                                        </td>
                                                                    </tr>
                                                                </>
                                                            )}
                                                            {add?.code === 5 && (
                                                                <>
                                                                    <tr style={{ backgroundColor: "#686868", color: "white" }}>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>SIZE</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>QUANTITY</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={6} />
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>TOTAL</p>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{printSizeOptions.find((size) => size.id === add?.structure?.dieCutSize)?.name}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.quantity}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={6} />
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.totalCost}</p>
                                                                        </td>
                                                                    </tr>
                                                                </>
                                                            )}
                                                            {add?.code === 6 && (
                                                                <>
                                                                    <tr style={{ backgroundColor: "#686868", color: "white" }}>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>SIDE</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>QUANTITY</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>TYPE</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>SIZE</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={4} />
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>TOTAL</p>
                                                                        </td>
                                                                    </tr>
                                                                    {add?.structure?.faces?.filter((face: any) => face.active).map((face: any) => {
                                                                        return (
                                                                            <tr key={face.id}>
                                                                                <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                                    <p>{face.name}</p>
                                                                                </td>
                                                                                <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                                    <p>{face.quantity}</p>
                                                                                </td>
                                                                                <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                                    <p>{face.laminationType}</p>
                                                                                </td>
                                                                                <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                                    <p>{printSizeOptions.find((size) => size.id === face.laminationSize)?.name}</p>
                                                                                </td>
                                                                                <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={4} />
                                                                                <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                                    <p>{face.totalCost}</p>
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    })}
                                                                </>
                                                            )}
                                                            {add?.code === 7 && (
                                                                <>
                                                                    <tr style={{ backgroundColor: "#686868", color: "white" }}>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>SIDE</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>QUANTITY</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>TYPE</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>SIZE</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={4} />
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>TOTAL</p>
                                                                        </td>
                                                                    </tr>
                                                                    {add?.structure?.faces?.filter((face: any) => face.active).map((face: any) => {
                                                                        return (
                                                                            <tr key={face.id}>
                                                                                <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                                    <p>{face.name}</p>
                                                                                </td>
                                                                                <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                                    <p>{face.quantity}</p>
                                                                                </td>
                                                                                <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                                    <p>{face.varnishType}</p>
                                                                                </td>
                                                                                <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                                    <p>{printSizeOptions.find((size) => size.id === face.laminationSize)?.name}</p>
                                                                                </td>
                                                                                <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={4} />
                                                                                <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                                    <p>{face.totalCost}</p>
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    })}
                                                                </>
                                                            )}
                                                            {add?.code === 8 && (
                                                                <>
                                                                    <tr style={{ backgroundColor: "#686868", color: "white" }}>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>TYPE</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>QUANTITY</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={6} />
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>TOTAL</p>
                                                                        </td>
                                                                    </tr>
                                                                    {Object.keys(add?.structure).map((key: any) => {
                                                                        if (add?.structure[key].active) {
                                                                            return (
                                                                                <tr key={key}>
                                                                                    <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                                        <p>{key}</p>
                                                                                    </td>
                                                                                    <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                                        <p>{add?.structure[key].quantity}</p>
                                                                                    </td>
                                                                                    <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={6} />
                                                                                    <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                                        <p>{add?.structure[key].totalCost}</p>
                                                                                    </td>
                                                                                </tr>
                                                                            )
                                                                        }
                                                                        return null;
                                                                    }
                                                                    )}
                                                                </>
                                                            )}
                                                            {add?.code === 9 && (
                                                                <>
                                                                    <tr style={{ backgroundColor: "#686868", color: "white" }}>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>SIZE</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>PRINT SIZE</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>COLOR</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>QUANTITY</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={4} />
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>TOTAL</p>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{printSizeOptions.find((size) => size.id === add?.structure?.paperSize)?.name}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.printSize}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.numberOfColor}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.quantity}</p>
                                                                        </td>
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }} colSpan={4} />
                                                                        <td style={{ border: "1px solid white", textAlign: "center" }}>
                                                                            <p>{add?.structure?.totalCost}</p>
                                                                        </td>
                                                                    </tr>
                                                                </>
                                                            )}
                                                        </>
                                                    )
                                                })}
                                            </>
                                        ))}
                                    </tbody>
                                </table>
                                <table style={{ width: "30%", borderCollapse: "collapse", marginRight: "auto", direction: "rtl" }}>
                                    <tr>
                                        <td style={{ border: "1px solid black", textAlign: "center", backgroundColor: "#1f2937", color: "white" }}>
                                            <p>المجموع</p>
                                        </td>
                                        <td style={{ border: "1px solid black", textAlign: "center", fontWeight: 600 }}>
                                            <p>{total}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: "1px solid black", textAlign: "center", backgroundColor: "#1f2937", color: "white" }}>
                                            <p>هامش الربح</p>
                                        </td>
                                        <td style={{ border: "1px solid black", textAlign: "center", fontWeight: 600 }}>
                                            <p>{profit}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: "1px solid black", textAlign: "center", backgroundColor: "#1f2937", color: "white" }}>
                                            <p>المجموع بدون ضريبة</p>
                                        </td>
                                        <td style={{ border: "1px solid black", textAlign: "center", fontWeight: 600 }}>
                                            <p>{totalAmountIncludingProfit}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: "1px solid black", textAlign: "center", backgroundColor: "#1f2937", color: "white" }}>
                                            <p>الضريبة</p>
                                        </td>
                                        <td style={{ border: "1px solid black", textAlign: "center", fontWeight: 600 }}>
                                            <p>{totalTaxAmount}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: "1px solid black", textAlign: "center", backgroundColor: "#1f2937", color: "white" }}>
                                            <p>الخصم</p>
                                        </td>
                                        <td style={{ border: "1px solid black", textAlign: "center", fontWeight: 600 }}>
                                            <p>{totalDiscount}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: "1px solid black", textAlign: "center", backgroundColor: "#1f2937", color: "white" }}>
                                            <p>الإجمالي شامل الضريبة</p>
                                        </td>
                                        <td style={{ border: "1px solid black", textAlign: "center", fontWeight: 600 }}>
                                            <p>{totalCost}</p>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }

    const PrintBtn = ({ rows, code }: { rows: PricingWithUserAndCustomer[], code: string }) => {
        const contentToPrint = React.useRef(null);
        const handlePrint = useReactToPrint({
            content: () => contentToPrint.current,
        });

        const { site } = React.useContext(SiteContext) as AppContextProps;

        if (!site) {
            return null;
        }

        const totalCost = rows.filter((row) => row.code === code).reduce((acc, row) => acc + (row.totalCost || 0), 0).toFixed(2);
        const totalAmountIncludingProfit = rows.filter((row) => row.code === code).reduce((acc, row) => acc + ((row.total as number) + ((row.total as number) * (row.profit as number) || 0) / 100), 0).toFixed(2);
        const totalTaxAmount = rows.filter((row) => row.code === code).reduce((acc, row) => acc + (((row.totalCost as number) - (row.total as number)) || 0), 0).toFixed(2);
        const totalDiscount = rows.filter((row) => row.code === code).reduce((acc, row) => acc + (row.discount || 0), 0).toFixed(2);

        const currentRow = rows.find((row) => row.code === code);

        return (
            <>
                <Button variant="contained" onClick={handlePrint}>
                    Print
                </Button>
                <div style={{ display: "none" }}>
                    <div ref={contentToPrint}>
                        {rows.length > 0 && (
                            <div style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "11px" }}>
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
                                        {site.logo && (<Image src={site.logo} alt="logo" width={50} height={50} style={{ objectFit: "contain" }} />)}
                                        <h1 style={{ fontWeight: 600, fontSize: "14px" }}>{site.companyName}</h1>
                                        <p>{site.address}</p>
                                        <p>{site.phone1} {site.phone2 && ` - ${site.phone2}`}</p>
                                        <p>{site.VATNumber}</p>
                                        <p>CR: {site.CRNumber}</p>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "end" }}>
                                        <h1 style={{ fontWeight: 600 }}>تسعيرة</h1>
                                        <p style={{ fontWeight: 600 }}>{currentRow?.code} :رقم التسعير</p>
                                        <p>{currentRow?.customer?.companyName || ""}</p>
                                        <p>{currentRow?.customer?.vatNumber || ""} :الرقم الضريبي</p>
                                        <p>{new Date(currentRow?.createdAt as Date).toLocaleDateString()} :التاريخ المقدر</p>
                                    </div>
                                </div>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }} colSpan={6}>
                                                <p>#</p>
                                            </th>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left", minWidth: "200px" }} colSpan={8}>
                                                <p>البيان</p>
                                                <p>Description</p>
                                            </th>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }} >
                                                <p>الكمية</p>
                                                <p>Qty</p>
                                            </th>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }} >
                                                <p>سعر الوحدة</p>
                                                <p>Unit Price</p>
                                            </th>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }} >
                                                <p>المبلغ بدون ضريبة</p>
                                                <p>Amount Excluding VAT</p>
                                            </th>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }} >
                                                <p>مبلغ الضريبة</p>
                                                <p>Tax Amount</p>
                                            </th>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }} >
                                                <p>المجموع شامل الضريبة</p>
                                                <p>Total Including VAT</p>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.filter((row) => row.code === code).map((input, index) => {
                                            const unitPrice = (((input.total || 0) + ((input.total as number) * (input.profit as number) || 0) / 100) / ((input.structure as any)?.sheetsQuantity || 1)).toFixed(2);
                                            return (
                                                <tr style={{ backgroundColor: "#f3f4f6" }} key={input.id}>
                                                    <td style={{ border: "1px solid white", padding: "5px", textAlign: "left" }} colSpan={6}>
                                                        <p>{index + 1}</p>
                                                    </td>
                                                    <td style={{ border: "1px solid white", padding: "5px", textAlign: "left" }} colSpan={8}>
                                                        <p style={{ fontWeight: 600 }}>{input.description}</p>
                                                    </td>
                                                    <td style={{ border: "1px solid white", padding: "5px", textAlign: "right" }} >
                                                        <p>{((input.structure) as any)?.sheetsQuantity}</p>
                                                    </td>
                                                    <td style={{ border: "1px solid white", padding: "5px", textAlign: "right" }} >
                                                        <p>{unitPrice}</p>
                                                    </td>
                                                    <td style={{ border: "1px solid white", padding: "5px", textAlign: "right" }} >
                                                        <p>{+((input.total || 0) + ((input.total as number) * (input.profit as number) || 0) / 100).toFixed(2)}</p>
                                                    </td>
                                                    <td style={{ border: "1px solid white", padding: "5px", textAlign: "right" }} >
                                                        <p>{((input.totalCost || 0) - (input.total || 0)).toFixed(2)}</p>
                                                    </td>
                                                    <td style={{ border: "1px solid white", padding: "5px", textAlign: "right" }} >
                                                        <p>{input.totalCost}</p>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                                <table style={{ width: "30%", borderCollapse: "collapse", marginRight: "auto", direction: "rtl" }}>
                                    <tr>
                                        <td style={{ border: "1px solid black", textAlign: "center", backgroundColor: "#1f2937", color: "white" }}>
                                            <p>المجموع بدون ضريبة</p>
                                        </td>
                                        <td style={{ border: "1px solid black", textAlign: "center", fontWeight: 600 }}>
                                            <p>{totalAmountIncludingProfit}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: "1px solid black", textAlign: "center", backgroundColor: "#1f2937", color: "white" }}>
                                            <p>الضريبة</p>
                                        </td>
                                        <td style={{ border: "1px solid black", textAlign: "center", fontWeight: 600 }}>
                                            <p>{totalTaxAmount}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: "1px solid black", textAlign: "center", backgroundColor: "#1f2937", color: "white" }}>
                                            <p>الخصم</p>
                                        </td>
                                        <td style={{ border: "1px solid black", textAlign: "center", fontWeight: 600 }}>
                                            <p>{totalDiscount}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: "1px solid black", textAlign: "center", backgroundColor: "#1f2937", color: "white" }}>
                                            <p>الإجمالي شامل الضريبة</p>
                                        </td>
                                        <td style={{ border: "1px solid black", textAlign: "center", fontWeight: 600 }}>
                                            <p>{totalCost}</p>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }

    return (
        <Box
            component="div"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'end',
                width: '100%',
                gap: 3,
            }}
        >
            <Form onClose={handleClose} open={open} onSubmit={selectedId ? handleUpdate : handleCreate} initialValues={selectedId ? rows.find((row) => row.id === selectedId) : null} />
            <Box
                component="div"
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'end',
                    alignItems: 'center',
                    width: '100%',
                    gap: 1,
                }}
            >
                <TextField placeholder="Search" variant="outlined" value={search} onChange={(e) => { handleSearch(e.target.value) }} sx={{
                    [`& input`]: {
                        height: "37px",
                        padding: "0 14px",
                    },
                }}
                />
                <Button variant="contained" sx={{ textWrap: "nowrap" }} onClick={handleClickOpen}>
                    Add Pricing [N]
                </Button>
            </Box>
            <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                <Table sx={{ minWidth: 700 }} aria-label="customized table" size={'small'}>
                    <TableHead>
                        <TableRow>
                            {headCells.map((headCell) => (
                                <StyledTableCell
                                    key={headCell.id}
                                    align={headCell.id === 'peices' || headCell.id === 'createdAt' ? 'right' : 'left'}
                                    sortDirection={orderBy === headCell.id ? order : false}
                                >
                                    {headCell.id === 'name' || headCell.id === 'code' || headCell.id === 'createdAt' ? (
                                        <StyledTableSortLabel
                                            sx={{ "&.MuiTableSortLabel-root": { color: "white" }, "&.MuiTableSortLabel-active": { color: "white" }, "&.MuiTableSortLabel-icon": { color: "white" } }}
                                            active={orderBy === headCell.id}
                                            direction={orderBy === headCell.id ? order : 'asc'}
                                            onClick={(event) => handleRequestSort(event, headCell.id as keyof PricingWithUserAndCustomer)}
                                            disabled={loading}
                                        >
                                            {headCell.label}
                                        </StyledTableSortLabel>
                                    ) : (
                                        headCell.label
                                    )}
                                </StyledTableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <StyledTableRow>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell sx={{ display: 'flex', gap: 2, flexDirection: "row", justifyContent: "end", alignItems: "center" }}>
                                    <Skeleton variant="circular" width={35} height={35} />
                                    <Skeleton variant="circular" width={35} height={35} />
                                </StyledTableCell>
                            </StyledTableRow>
                        ) : rows.length === 0 ?
                            <StyledTableRow>
                                <StyledTableCell colSpan={5} align="center">No data found</StyledTableCell>
                            </StyledTableRow>
                            :
                            rows.map((row) => (
                                <StyledTableRow key={row.id}>
                                    <StyledTableCell component="th" scope="row">
                                        <Box sx={{ display: 'flex', gap: 2, flexDirection: "row", justifyContent: "start", alignItems: "center" }}>
                                            {row.code}
                                            <PreviewBtn rows={rows} code={row.code as string} />
                                        </Box>
                                    </StyledTableCell>
                                    <StyledTableCell>{row.customer?.companyName || ""}</StyledTableCell>
                                    <StyledTableCell>{row.delegate?.name || ""}</StyledTableCell>
                                    <StyledTableCell>{row.totalCost}</StyledTableCell>
                                    <StyledTableCell align="right">
                                        {new Date(row.createdAt as Date).toLocaleString()}
                                    </StyledTableCell>
                                    <StyledTableCell align="right">
                                        <Box sx={{ display: 'flex', gap: 1, flexDirection: "row", justifyContent: "end", alignItems: "center" }}>
                                            <PrintBtn rows={rows} code={row.code as string} />
                                            <IconButton aria-label="edit" sx={{ color: "success.main", p: 0 }} onClick={() => handleEdit(row.id!)}>
                                                <EditRoundedIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                            <DeleteBTN onAgree={() => handleDelete(row.id!)} />
                                        </Box>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Box>
    );
}
