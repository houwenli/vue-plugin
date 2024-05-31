const filtersData = {
    //订单类型
    orderTypeFilters: [
        { id: 20, value: '快车实时单' },
        { id: 21, value: '快车预约单' },
        { id: 22, value: '快车扫码起单' },
        { id: 40, value: '拼车预约单' },
        { id: 30, value: '专车实时单' },
        { id: 31, value: '专车预约单' },
        { id: 32, value: '专车扫码起单' },
        { id: 10, value: '出租车实时单' },
        { id: 11, value: '出租车预约单' },
        { id: 12, value: '出租车扫码起单' }
    ],
    //业务类型
    bussinessFilters: [
        { id: 200, value: '快车' },
        { id: 400, value: '街坊专车' },
        { id: 600, value: '村村通拼车' },
        { id: 300, value: '出租车' }
    ],
    //运管类型
    operationManagementFilters: [
        { id: 0, value: 'A类' },
        { id: 1, value: 'B类' },
        { id: 2, value: 'C类' },
        { id: 3, value: 'D类' }
    ],
    //车主类型
    motorcycleOwnerFilters: [
        { id: 1, value: '普通车主' },
        { id: 2, value: '共享共创人' },
        { id: 3, value: '高级共创人' }
    ],
    //服务车型
    motorcycleFilters: [
        { id: 1, value: 'A级车' },
        { id: 2, value: 'B级车' },
        { id: 3, value: 'C级车' }
    ],
    //司机包干类型
    contractFilters: [
        { id: 0, value: '非包干' },
        { id: 1, value: '有效包干' },
        { id: 2, value: '无效包干' }
    ]
};

export default filtersData;
