import net from '@/net'
import TeamData from '@/data/Team';

const API = process.env.REACT_APP_MEDIA_API;

export default {
	/* ============= 文章管理/文章列表 =============  */
	// 获取文章列表
	getArticles: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/articles`, data);
	},
	// 获取单篇文章信息
	getSingleArticle: (_id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/article/${_id}`);
	},
	// 创建文章
	createArticle: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/article`, data);
	},
	// 编辑文章信息
	updateArticle: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/article/${_id}/single`, data);
	},
	// 启用文章
	enabledArticle: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/articles/batch_enabled`, data);
	},
	// 禁用文章
	disabledArticle: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/articles/batch_disabled`, data);
	},
	// 删除文章
	deleteArticle: (_id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/article/${_id}`);
	},

	/* ============= 文章管理/分类管理 =============  */
	// 获取分类列表
	getArticleCategorys: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/articles/categorys`, data);
	},
	// 创建分类
	createArticleCategory: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/articles/category`, data);
	},
	// 编辑分类信息
	updateArticleCategory: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/articles/category/${_id}`, data);
	},
	// 删除分类
	deleteArticleCategory: (_id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/articles/category/${_id}`);
	},

	/* ============= 文章管理/标签管理 =============  */
	// 获取标签列表
	getArticleTags: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/articles/tags`, data);
	},
	// 创建标签
	createArticleTag: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/articles/tag`, data);
	},
	// 编辑标签信息
	updateArticleTag: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/articles/tag/${_id}`, data);
	},
	// 删除标签
	deleteArticleTag: (_id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/articles/tag/${_id}`);
	},
	/* ============= 文章管理/作者管理 =============  */
	// 获取作者列表
	getArticleAuthors: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/articles/authors`, data);
	},
	// 创建作者
	createArticleAuthor: (data) => {
		return net.POST_UPLOAD(`${API}/teams/${TeamData.currentId}/articles/author`, data);
	},
	// 编辑作者信息
	updateArticleAuthor: (_id, data) => {
		return net.PUT_UPLOAD(`${API}/teams/${TeamData.currentId}/articles/author/${_id}`, data);
	},
	// 删除作者
	deleteArticleAuthor: (_id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/articles/author/${_id}`);
	},



	/* ============= 视频管理/视频列表 =============  */
	// 获取视频列表
	getVideos: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/videos`, data);
	},
	// 创建视频
	createVideo: (data) => {
		return net.POST_UPLOAD(`${API}/teams/${TeamData.currentId}/video`, data);
	},
	// 编辑视频信息
	updateVideo: (_id, data) => {
		return net.PUT_UPLOAD(`${API}/teams/${TeamData.currentId}/video/${_id}`, data);
	},
	// 删除视频
	deleteVideo: (_id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/video/${_id}`);
	},

	/* ============= 视频管理/分类管理 =============  */
	// 获取分类列表
	getVideoCategorys: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/videos/categorys`, data);
	},
	// 创建分类
	createVideoCategory: (data) => {
		return net.POST_UPLOAD(`${API}/teams/${TeamData.currentId}/videos/category`, data);
	},
	// 编辑分类信息
	updateVideoCategory: (_id, data) => {
		return net.PUT_UPLOAD(`${API}/teams/${TeamData.currentId}/videos/category/${_id}`, data);
	},
	// 删除分类
	deleteVideoCategory: (_id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/videos/category/${_id}`);
	},

	/* ============= 视频管理/标签管理 =============  */
	// 获取标签列表
	getVideoTags: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/videos/tags`, data);
	},
	// 创建标签
	createVideoTag: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/videos/tag`, data);
	},
	// 编辑标签信息
	updateVideoTag: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/videos/tag/${_id}`, data);
	},
	// 删除标签
	deleteVideoTag: (_id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/videos/tag/${_id}`);
	},



	/* ============= 方案管理 =============  */
	// 获取方案列表
	getScheme: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/schemes`, data);
	},
	// 获取单个方案
	getSingleScheme: (_id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/scheme/${_id}`);
	},
	// 创建方案
	createScheme: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/scheme`, data);
	},
	// 编辑方案
	updateScheme: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/scheme/${_id}/single`, data);
	},
	// 删除方案
	deleteScheme: (_id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/scheme/${_id}`);
	},

	/* ============= 方案管理/分类管理 =============  */
	// 获取分类列表
	getSchemeCategory: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/schemes/categorys`, data);
	},
	// 获取单个分类
	getSingleSchemeCategory: (_id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/schemes/category/${_id}`);
	},
	// 创建分类
	createSchemeCategory: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/schemes/category`, data);
	},
	// 编辑分类
	updateSchemeCategory: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/schemes/category/${_id}`, data);
	},
	// 删除分类
	deleteSchemeCategory: (_id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/schemes/category/${_id}`);
	},

	/* ============= 方案管理/专家管理 =============  */
	// 获取专家列表
	getSchemeExpert: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/schemes/experts`, data);
	},
	// 获取单个专家
	getSingleSchemeExpert: (_id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/schemes/expert/${_id}`);
	},
	// 创建专家
	createSchemeExpert: (data) => {
		return net.POST_UPLOAD(`${API}/teams/${TeamData.currentId}/schemes/expert`, data);
	},
	// 编辑专家
	updateSchemeExpert: (_id, data) => {
		return net.PUT_UPLOAD(`${API}/teams/${TeamData.currentId}/schemes/expert/${_id}`, data);
	},
	// 删除专家
	deleteSchemeExpert: (_id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/schemes/expert/${_id}`);
	},

	/* ============= 方案管理/方案订单 =============  */
	// 获取方案订单列表
	getSchemeOrder: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/schemes/orders`, data);
	},
	// 导出方案订单信息
	getSchemeOrderExport: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/schemes/orders/export`, data);
	},

	/* ============= 直播管理 =============  */
	// 获取直播列表
	getRoomsList: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/live/rooms`, data);
	},
	// 获取单个直播信息
	getSingleRoom: (_id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/live/rooms/${_id}`);
	},
	// 创建直播
	createRoom: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/live/room`, data);
	},
	// 编辑直播信息
	editRoom: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/live/room/${_id}`, data);
	},
	// 删除直播
	deleteRoom: (_id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/live/room/${_id}`);
	},
	// 批量删除直播
	batchDelRoom: (data) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/live/rooms/batch_delete`, data);
	},
	// 启用直播
	openRoom: (_id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/live/room/${_id}/enabled`);
	},
	// 批量启用直播
	batchOpenRoom: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/live/rooms/batch_enabled`, data);
	},
	// 禁用直播
	disRoom: (_id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/live/room/${_id}/disabled`);
	},
	// 批量禁用直播
	batchDisRoom: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/live/rooms/batch_disabled`, data);
	},

	/* ============= 直播专题管理 =============  */
	// 获取专题列表
	getSpecialsList: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/live/specials`, data);
	},
	// 获取单个专题信息
	getSingleSpecial: (_id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/live/special/${_id}`);
	},
	// 创建专题
	createSpecial: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/live/special`, data);
	},
	// 编辑专题信息
	editSpecial: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/live/special/${_id}`, data);
	},
	// 删除专题
	deleteSpecial: (_id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/live/special/${_id}`);
	},
	// 启用专题
	openSpecial: (_id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/live/special/${_id}/enabled`);
	},
	// 禁用专题
	disSpecial: (_id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/live/special/${_id}/disabled`);
	},
	// 批量启用专题
	openSpecials: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/live/special/batch_enabled`, data);
	},
	// 批量禁用专题
	disSpecials: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/live/special/batch_disabled`, data);
	},

	/* ============= 主播管理 =============  */
	// 获取主播列表
	getAnchorsList: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/live/anchors`, data);
	},
	// 创建主播
	createAnchor: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/live/anchor`, data);
	},
	// 编辑主播
	editAnchor: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/live/anchor/${_id}`, data);
	},
	// 删除主播
	deleteAnchor: (_id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/live/special/${_id}`);
	},
	// 启用主播
	openAnchor: (_id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/live/anchor/${_id}/enabled`);
	},
	// 禁用主播
	disSpecial: (_id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/live/anchor/${_id}/disabled`);
	},

	/* ============= 礼物管理 =============  */
	// 获取礼物列表
	getGiftsList: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/live/gifts`, data);
	},
	// 创建礼物
	createGift: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/live/gift`, data);
	},
	// 编辑礼物
	editGift: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/live/gift/${_id}`, data);
	},
	// 删除礼物
	deleteGift: (_id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/live/gift/${_id}`);
	},
	// 启用礼物
	openGift: (_id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/live/gift/${_id}/enabled`);
	},
	// 禁用礼物
	disGift: (_id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/live/gift/${_id}/disabled`);
	},
}
