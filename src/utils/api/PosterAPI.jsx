import api from '../api/BaseAPI';

export const Image = {
    /**
     * 썸네일 리스트 조회 API
     * FE에서는 이 리스트를 세션/스토어에 저장해서
     * index 기반으로 상세 이미지 불러오기
     *
     * 반환 예:
     * [
     *   {
     *     filePathNo: number,
     *     promptNo: number,
     *     generatedAssetNo: number
     *   }
     * ]
     */
    getThumbnailList: (type = "포스터") => {
        return api.get(`/api/assets/list`, {
            params: { type }
        })
        .then(res => res.data)
        .catch(err => {
            console.error("썸네일 리스트 조회 오류:", err);
            throw err;
        });
    },

    /**
     * 단건 상세 조회 API
     * filePathNo + promptNo 조합으로 이미지 + 프롬프트 조회
     * 
     * 반환 예:
     * {
     *   fileUrl: string,
     *   fileName: string,
     *   extension: string,
     *   promptNo: number,
     *   visualPrompt: string,
     *   styleName: string
     * }
     */
    getDetail: ({ filePathNo, promptNo }) => {
        return api.get(`/api/assets/detail/${filePathNo}/${promptNo}`)
        .then(res => res.data)
        .catch(err => {
            console.error("상세 이미지 조회 오류:", err);
            throw err;
        });
    },
}

export const Poster = {
    /**
     * 포스터 이미지 생성 관련 정보 조회 API
     * 특정 프로젝트에 대해서 생성된 각 포스터 초안 이미지가 어떤 포스터 프롬프트를 참조하는지 한 번에 받아오는 API
     * 
     * 
     * [
     *      {
     *          file_path_no: number,
     *          poster_prompt_no: number,
     *          visual_prompt: str
     *      },
     * ]
     */
    basePosterInfo: (pNo) => {
        return api.get(`/api/posters/${pNo}/elements`)
            .then((res) => res.data)
            .catch(err => {
                console.error("포스터 요소 조회 에러:", err);
                throw err;
            });
    },

    /**
     * 사용자의 수정된 프롬프트를 통해서 이미지 재생성하는 API
     * 
     * 백엔드로 보내는 데이터
     * {
     *      visual_prompt: string   // 사용자가 입력한 새로운 프롬프트
     * }
     * 
     * 백엔드에서 반환 할 데이터
     * 
     * {
     *    file_path_no: number,      // 이미지 고유번호 (PK)
     *    file_url: string,          // 새로 생성된 이미지의 URL
     *    visual_prompt: string,     // 최종 적용된 프롬프트
     *    regenerated: boolean,      // 새롭게 생성됐는지 여부 T/F
     *    message: string,           // "success" 또는 "fail"  
     * }
     */
    updatePosterInfo: (filePathNo, visualPrompt) => {
        return api.post(`/api/posters/${filePathNo}/regenerate`, { visual_prompt: visualPrompt })
            .then(({data}) => data)
            .catch(err => {
                console.error("이미지 재생성 중 에러:", err);
                throw err;
        });
    },

    // 1) 프롬프트 생성
    generatePrompt: (trendData) => {

        return api
            .post(`/api/generate-prompt`, trendData)
            .then((res) => res.data)
            .catch((err) => {
                console.error("❌ 프롬프트 생성 중 에러", err);
                throw err;
            });
    },

    // 2) 이미지 생성
    createImage: (trendData) => {
    return api
        .post("/api/create-image", trendData)
        .then((res) => {
        console.log("🎯 [createImage] 응답:", res.data);
        return res.data.images || [];
        })
        .catch((err) => {
        console.error("❌ 이미지 생성 중 에러", err);
        throw err;
        });
    },
}