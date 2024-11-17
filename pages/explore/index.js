const { getSpots } = require('../../api/spot');
const app = getApp();
Page({
    data: {
        province: {
            value: 0, // 当前选中的省份索引，默认选中第一个，即 "全部省份"
            options: [
                { value: 0, label: '全部省份' } // 初始化时包含 "全部省份" 选项
            ]
        },
        city: {
            value: 0, // 当前选中的城市索引
            options: [
                { value: 0, label: '全部城市' } // 初始化时包含 "全部城市" 选项
            ]
        },
        type: {
            value: 0, // 当前选中的类型索引
            options: [
                { value: 0, label: '全部类型' } // 初始化时包含 "全部类型" 选项
            ]
        },
        originalSpots: [], // 新增：保存原始数据
        spots: [], // 用于显示的筛选后数据
        favoriteSpotIds: [], // 用户收藏的景点ID列表
        isPickerDisabled: false, // 是否禁用下拉选择栏
    },

    async onLoad() {
        const favoriteSpotIds = app.globalData.favoriteSpotIds || [];
        const spots = await getSpots();

        this.setData({
            favoriteSpotIds: favoriteSpotIds,
            originalSpots: spots, // 保存原始数据
            spots: spots // 初始显示所有数据
        });

        this.generateFilterOptions();
        this.fetchSpotData();
    },

    onShow() {
        this.setData({ favoriteSpotIds: app.globalData.favoriteSpotIds || [] });
        this.fetchSpotData();
    },

    /**
     * 生成筛选项（省、市、类型）
     */
    generateFilterOptions() {
        const provinces = new Set();
        const types = new Set();

        this.data.originalSpots.forEach(spot => {
            if (spot.province) {
                provinces.add(spot.province);
            }
            if (spot.category) {
                types.add(spot.category);
            }
        });

        // 将所有省份选项追加到 options 中
        const provinceOptions = Array.from(provinces)
            .filter(province => province) // 过滤掉空值
            .map((province, index) => ({
                value: index + 1, // 从 1 开始，因为 0 是 "全部省份"
                label: province
            }));

        // 将所有类型选项追加到 options 中
        const typeOptions = Array.from(types)
            .filter(type => type) // 过滤掉空值
            .map((type, index) => ({
                value: index + 1, // 从 1 开始，因为 0 是 "全部类型"
                label: type
            }));

        console.log("生成的筛选选项:", {
            provinces: provinceOptions,
            types: typeOptions
        });

        // 设置初始数据，默认选中第一个
        this.setData({
            'province.options': [{ value: 0, label: '全部省份' }, ...provinceOptions],
            'type.options': [{ value: 0, label: '全部类型' }, ...typeOptions]
        }, () => {
            // 生成初始的城市选项
            this.updateCityOptions();
        });
    },

    /**
     * 处理省份选择变化
     * @param {Object} e - 事件对象
     */
    onProvinceChange(e) {
        if (this.data.isPickerDisabled) {
            return; // 如果 picker 被禁用，直接返回
        }

        // 获取选择的索引
        const selectedIndex = parseInt(e.detail.value, 10);

        // 禁用选择，防止用户多次点击
        this.setData({ isPickerDisabled: true });

        // 更新省份的索引并重置城市
        this.setData({
            'province.value': selectedIndex,
            'city.value': 0 // 重置城市选项为 "全部城市"
        }, () => {
            this.updateCityOptions(); // 根据选择的省份动态更新城市列表
            this.fetchSpotData(); // 重新加载景点数据

            // 在 500ms 后重新启用选择
            setTimeout(() => {
                this.setData({ isPickerDisabled: false });
            }, 500);
        });
    },
    /**
     * 动态生成城市选项
     */
    updateCityOptions() {
        const selectedProvince = this.data.province.options[this.data.province.value].label;
        const cities = new Set();

        this.data.originalSpots.forEach(spot => {
            if ((selectedProvince === '全部省份' || spot.province === selectedProvince) && spot.city) {
                cities.add(spot.city);
            }
        });

        // 将所有城市选项追加到 options 中
        const cityOptions = Array.from(cities)
            .filter(city => city) // 过滤掉空值
            .map((city, index) => ({
                value: index + 1, // 从 1 开始，因为 0 是 "全部城市"
                label: city
            }));

        console.log("生成的城市选项:", cityOptions);

        // 更新城市选项，默认选中"全部城市"
        this.setData({
            'city.options': [{ value: 0, label: '全部城市' }, ...cityOptions],
            'city.value': 0
        });
    },

    /**
     * 处理城市选择变化
     * @param {Object} e - 事件对象
     */
    onCityChange(e) {
        if (this.data.isPickerDisabled) {
            return; // 如果 picker 被禁用，直接返回
        }

        const selectedIndex = parseInt(e.detail.value, 10);

        // 禁用选择，防止用户多次点击
        this.setData({ isPickerDisabled: true });

        // 更新城市的索引
        this.setData({
            'city.value': selectedIndex
        }, () => {
            this.fetchSpotData(); // 重新加载景点数据

            // 在 500ms 后重新启用选择
            setTimeout(() => {
                this.setData({ isPickerDisabled: false });
            }, 500);
        });
    },

    /**
     * 处理类型选择变化
     * @param {Object} e - 事件对象
     */
    onTypeChange(e) {
        if (this.data.isPickerDisabled) {
            return; // 如果 picker 被禁用，直接返回
        }

        const selectedIndex = parseInt(e.detail.value, 10);

        // 禁用选择，防止用户多次点击
        this.setData({ isPickerDisabled: true });

        // 更新类型的索引
        this.setData({
            'type.value': selectedIndex
        }, () => {
            this.fetchSpotData(); // 重新加载景点数据

            // 在 500ms 后重新启用选择
            setTimeout(() => {
                this.setData({ isPickerDisabled: false });
            }, 500);
        });
    },

    /**
     * 获取景点数据，可以选择使用模拟数据或通过API获取
     */
    fetchSpotData() {
        // 使用原始数据进行筛选
        let filteredSpots = [...this.data.originalSpots];

        // 根据选择的省份进行筛选
        const selectedProvince = this.data.province.options[this.data.province.value].label;
        if (selectedProvince !== '全部省份') {
            filteredSpots = filteredSpots.filter(spot => spot.province === selectedProvince);
        }

        // 根据选择的城市进行筛选
        const selectedCity = this.data.city.options[this.data.city.value].label;
        if (selectedCity !== '全部城市') {
            filteredSpots = filteredSpots.filter(spot => spot.city === selectedCity);
        }

        // 根据选择的类型进行筛选
        const selectedType = this.data.type.options[this.data.type.value].label;
        if (selectedType !== '全部类型') {
            filteredSpots = filteredSpots.filter(spot => spot.category === selectedType);
        }

        console.log("筛选条件:", {
            province: selectedProvince,
            city: selectedCity,
            type: selectedType
        });

        // 更新显示的数据，但不影响原始数据
        this.setData({
            spots: filteredSpots
        });
    },


});
