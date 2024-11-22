import { ImageSearchImageRef } from '@/pages/search/component/ImageSearchImage';
import { IAccountResponse, IGalleryItem, IPosidonResponse, IProject, ISearchItem, ISearchResult } from '@/store/iTypes/iTypes';
import { psConfig } from '@/utlis/util-env';
import utilHttps from '@/utlis/util-https';
import axios from 'axios';
class psSerive {
    private static instance: psSerive;
    constructor() {
        console.log("注册成功");
    }
    public static getInstance(): psSerive {
        if (!psSerive.instance) {
            psSerive.instance = new psSerive();
        }
        return psSerive.instance;
    }
    public async generateImageUrl(path: string): Promise<string | undefined> {
        const imageData = window.cep.fs.readFile(path, "Base64")
        const binary = window.cep.encoding.convertion.b64_to_binary(imageData.data)
        const binaryLength = binary.length;
        const binaryArray = new Uint8Array(binaryLength);
        for (let i = 0; i < binaryLength; i++) {
            binaryArray[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([binaryArray], { type: 'application/octet-stream' });
        const formData = new FormData();
        formData.append('file', blob, path.split('/').pop());
        const result = await axios.post(psConfig.host + psConfig.generateURL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        if (result.status === 200) {
            const data = result.data as IPosidonResponse;
            if (data.code === 0) {
                console.log("进来了");
                return data.data.replace('..', '') as string;
            }
        }
        return undefined;
    }
    public async searchImage(projectId: number, pa: string, searchs: ISearchItem[], formats: string[], type: number) {
        const projectNames = searchs.map(item => { return item.projectName });
        let data = {
            SeachParameter: pa,
            ProjectId: projectId,
            page: searchs[0].page,
            size: 10,
            projectNames: projectNames,
            SearchType: type,
            filterExt: formats
        }
        console.log(data);
        let result = await utilHttps.httpPost(psConfig.searchImage, data);
        if (result.status == 200) {
            if (result.data?.code === 0) {
                const imgData = result.data?.data as ISearchResult[];
                console.log(imgData, "搜索结果");
                const res: ISearchResult = {
                    projectName: 'Testing_16_A25ae69055e',
                    page: 1,
                    data: [
                        {
                            id: "1",
                            path: 'https://svn-g86.gz.netease.com/trunk_branch/ui/cocos_project/all_project/Cocos_ui_g86/cocosstudio/_resource/asset/blueprint/item_0001_ad_lantu_top.png',
                            dis: 0,
                            thumbnail: 'iVBORw0KGgoAAAANSUhEUgAAAFwAAABcCAYAAADj79JYAAAACXBIWXMAAAsTAAALEwEAmpwYAAALaklEQVR4nO2dX2wTRx7Hv7P+S0JJnIuxfdADXZrkdKc6FwROEERCLYcQSYXUSA0ICSFdX3iriioC4p1EgujKvQeE1AceeIloKyEegLgk0Z1UkT7RBEIIf9y4JNFdrzhOducevBPPjmcd/107dL/ST+Ndr3d2PvPLb3dnN78hKK1Ijuvy+b7UogV8v95vclaxjSWSz3wpW1fK+guVCJBKStk6s9/nLGeBv5NBVbhl3hST31WDZDA1pIHzpkm2zRt8vsBF0AwoK8XPirBNLsBL3RnZoIgerXGlJlnmtykIfK7AzUDz5uBKB7cswq8WL5fB5k3lTONKsTPyAp9Lo3lAvMcyoE79s1MwHr4IXVZ3uTsgW9yWgdYArAqm6iXfAbzXy+oxaD0Pl8Vj3oOdAFycOYXPrDNkXl4NHi7zbgZ1FcCKbvxntqwg3Tn8/oAs0LMBl4UPEbRbMI9eyqAz8OtduZRbsqsP3rNF2EkAy3rJ2wrSfPhwI9ZjkBlwGWwGjoFmcL26ebjSA6Pni6GlmjxcDCW8Jy/rluDKBFIsWCcw8Kv6frNClwEXYzYPm4FmYGsAbBLMe/Dgwe19fX3vt7e3vxcMBoMNDQ31brfb43A4HPkxsUaqqqrJZHJ5YWFhKRaLxb7//vvpGzdu/HDnzp3nSAF+w5kbwK8w/sUm9V3x0Kn+nQG62Z0hH68ZbOa5m5ACXosU8FoANS6Xa/PAwMD+jz/++MDOnTt3mOx7I4nOzs7O3rx5825/f390ZWXlF6RA/48rWWewvwQWkvgTalbgsjDiRDp0bEIa8mYA7wCoPXv27O4zZ870+f3+raVudTUoHo/PX758+cbg4OC/kQL9XwC/IA3/DVLwk0ifA6SXjjLgZrBrdGOgt/j9/oaRkZGTnZ2de8vT1OrSgwcPxo4ePXr9559/XgDwH6TB/6pbNugAMsdC+FDCTng87HcAbAGwpa2tbfu33377WSgUeld2cKOjo/jmm2/w3XffYXp6GgsLC1heXjZsoygKCCk88miaBkqLH1fyeDzw+XxoamrC/v37ceTIEXR1dUmP7cWLF3Pd3d3/ePjw4XOkoDPwPHR20jUNLUAKNjsx1gCoA7AVwE4AfwbQCeAQgE/C4fDn8Xh8nkp0/fp12traSgkhawbjNe+aEUKooigFW7Z9F2stLS302rVrVFXVjDbG4/H5tra2zwF8ojPp1Bnt1JnV6QzdOtOMnmOe7UTKozcD+B2A7QBaAOwG8AGA3kAgcPrZs2ez4kFMTU3Rjo6OnEBvJItEInRmZiYD+tzc3GwwGDwNoFdns1tntV1nt1lnye66DdBF764HEATwRwBhAF0APgJw8sGDB2OaplFN09Yqv337Nq2rq3vrYDPz+/30/v37GdDHxsbGAJzU2XTprJp0dvXI4uUMuAdp734XwJ8ARJD6s+n74osvrqiqSnngo6Oj1OPxvJWgeXO73fTevXsZ0M+ePXsFQJ/OKKIzexdpL/fIgCtInSA3IRV/Akh5d5vec0cdDsffY7HYTzzwmZkZ6vf7Kw7DKvP7/fTJkycG4PPz8/Ner/dTAEd1Vm06u4DOcpPOdu25AIvfbqSur30AtiEVj/YA+BuAY5cuXbqmqipltrq6Sjs6OioOwWqLRCIZJ9KhoaFrAI7prPbo7LbpLGt1tmtxXAwnjQB2APgLgH0AegCcevLkyQwPfHh4uOKNr5QNDw8bgD99+vQpgFM6q306ux06y4ywwoB7kbrGDiAV+P8K4ACA3g8//PCCqqoa793Nzc0Vb3ilrLm52XDRQCnVDh06dAGpK5YDOrsmneUWpK9WCBu8Em962CWiC4Dr+PHj74ML+tFoFFNTU/itampqCtFoFF1dXWwVOXbsWPj27dvTSA9L8yzX2MmA84NWLgCutra29/gKb926Vb7WbBDdunWLB45wONwE43MA6XC0E2n64uMzZq5QKBTkK5uYmChjUzaGxsfHDcs6I37sn/dudoViCCmA/MGww+fz1fM7f/ToUelbsMH0448/GpZ9Pp8P5g/PAc7DeYlP4x0AHG6328NvtLi4WNqj34ASGbjdbnZHafbQHEBmDJe+AuFwOByUG5VbWVkpRxs2lMSRT/1pltlrIYYYLioDPiHEdBiVracFDpMWMzxbrAo95iySQubFAxc3WPepOuuIYmEXs49C66WUlqNeGTMD11w8vKwuWCkPL1Mnr8tOvEqxXFZ6diXrhOQ63HQjW3kpK89CX1e2VaCyvXllqzhJGdoebrFkd5q2SivpnaYti2QDt1g2cItlA7dYNnCLZQO3WDZwi2UDt1g2cItlA7dYNnCLZQO3WDZwi2UDt1g2cItlA7dYNnCLZQO3WDZwiyUCr8gbMm+5DExtD7dYZsAt8/Ri376t4jqlO6+4h7O3WCtRbyXkRHZvln7Hv3lazIGX6ZXhnOrly1LvPtt3zhw2ylAp/yQr5WkVEAXkIUX2z6C2ctO67JySjfllwAaej2TMDFxz8XBNso0tuWSZmQ3iY7gIec00TVMVRVnLOejxeJBIJMp76FWu1H8JpqWqarZkwGvwZXeaGYlvk8nkstfrrWEb1dfXIxaLlaUhG0UNDQ2G5WQymYQxUXBGRjfA6OFAZg+pANTFxcWlUCi0Bry1tfU3D7y1tdWwvLS0tIQ0cNFxAc7DedhsQz539kosFouFQqHfs513dnbi3r175WpL1YsQgs7OTsO6ly9fvkI6dZ6YnXMNuhjDxZTOKwBWJicnH7e3t+9iO+/u7sbg4GDZGlTNYvcgPT09hvWTk5OPYUx3zYcWwwl03QQ1hw8fvkApNWRkaWlpqXiimEoYIYQ2NzeLucZyTlDDAzdNwaQoyqm5ubkZvoarV69WvPGVgE0IKUkKpqxJxgghx7788strhi7VNBqJRCoOwWrgHR0donfnnWQMWCeNHiHkaE1NzaevX782pD+dmZmhgUDgrc5XyNvWrVtLkkYPWCdRJCHkkKIofefOnbvCezillI6Pj9Pa2tq3HrrH45Fm5+zv7/8nCkgUaZYKtQlAmBDSRQj5SFGUkxMTE2M8cEopvXv3Lq2rq6s4lHJZY2MjHR0dzYA9MTExjiJSoWZN9ksI+QBAbzAYPP3q1Stpst+3Mabv2bMnI4xQSunz589nQ6FQwcl+GfSc0llHIpHPE4nEPPN05u2aptGrV69mpLM2s0rDzGYtLS10eHi45OmsC0rY7nQ6t+zatWv7yMjIZ4FAQJqwPRqN4uuvv0Y0GsXjx4+xuLiI1HBDWpTSqngA4Xa71xK279u3Dz09PWVL2F7UlASNjY0NIyMjJ/fu3VvwlASVBJ7vs9RST0nAlvOadENRlNr+/v49Z86c6WtoaPDn1QJsDODxeDw+NDR0Y2Bg4F8o8aQbbF1O08oQQmpY6fV637l48eL+3t7eA9u2bfuDyb4zVM3Anz17Nnvz5s2758+fjyYSCRY2zKaV4WHnPK0Mv45PB2c6cRIhxDBxEiHEe/Dgwe0nTpwIh8Ph94LBYMDn89W7XC6voiiKWBkDbuWrEmKdqqpqyWQysbi4uBSLxX6anJyc/uqrryZNJk56gxRwfgYrNhbOe7Zs/k1TL5TlMLSnBktPDcbPz8YPycqe9BiUy5tXrKdWhYPkx32TSEFOwDj5nVkuVkhKq0QlJQPF2sNDZ5PdLSPdCQw02142FCuNldnevBKhi9eqPHSXfhCy6R3ZsORGmN6Rwjh/ZrbpHcUJTkU+UuXSaN4T853AlJUbaQJT5ullmcA010bykKT5afHbnqI3J9hA/o02Ay+GDBFyPrBL3RHZIMigi/DFkFMQaKZCGyeCB+SJbhls2e+qQTJguUyznjdopmIbbpYc2OxKxOq4baZs8VwsZXALvlsrdYOz3UhZdQzraT1Ysu9Ldjv8f0QBMI2FqiXqAAAAAElFTkSuQmCC',
                            name: 'item_0001_ad_lantu_top.png',
                            ext: 'png'
                        }
                    ],
                    dis: 0,
                    isTotal: true
                }
                imgData.push(res);
                const res1: ISearchResult = {
                    projectName: 'Testing_16_A8a4d5d1e8e',
                    page: 1,
                    data: [
                        {
                            id: "2",
                            path: 'https://svn-g86.gz.netease.com/trunk_branch/ui/cocos_project/all_project/Cocos_ui_g86/cocosstudio/_resource/asset/blueprint/item_0001_ad_lantu_top.png',
                            dis: 0,
                            thumbnail: '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',
                            name: 'item_0001_ad_lantu_top.png',
                            ext: 'png'
                        }
                    ],
                    dis: 0.1,
                    isTotal: true
                }
                imgData.push(res1);
                const res2: ISearchResult = {
                    projectName: 'inte670f3f58b1bb458b',
                    page: 1,
                    data: [
                        {
                            id: "3",
                            path: 'https://svn-g86.gz.netease.com/trunk_branch/ui/cocos_project/all_project/Cocos_ui_g86/cocosstudio/_resource/asset/blueprint/item_0001_ad_lantu_top.png',
                            dis: 0,
                            thumbnail: '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',
                            name: 'item_0001_ad_lantu_top.png',
                            ext: 'png'
                        }
                    ],
                    dis: 0.1,
                    isTotal: true
                }
                imgData.push(res2);
                this.notifySearchResult(type, imgData);
                return;
            }
        }

        //回滚状态
        this.notifySearchResult(type, undefined);
        return;
    }
    public async GetSVNAccountByProjectName(projectName: string): Promise<IAccountResponse> {
        const response: any = await utilHttps.httpGet(psConfig.getSvnAccountByProjectName, { projectName: projectName })
        if (response.status != 200) {
            // ExDialogRef.current.showMessage("请求失败", `原因为:${response1.message}`, 'error')
            return;
        }
        const result = response.data as IPosidonResponse;
        if (result.code != 0) {
            return
        }
        const data = result.data as IAccountResponse;
        return data;

    }
    public notifySearchResult(type: number, data: ISearchResult[]) {
        if (type === 0) {
            ImageSearchImageRef.current?.setSearchResult(data);
        }
    }
}

const iService = psSerive.getInstance();
export default iService;