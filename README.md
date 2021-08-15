# NMCv1
node.js mysql

#关于express的安装
### 1、使用git，通过npm包管理器，安装express 和express种子生成器（express-generator 生成目录文件）； ###

```

	//express
	cnpm i	express -g
  //有的需要创建软连接link -s /home/nodev8/node /usr/local/bin(说明/home/nodev8/node是自己的node全局安装目录，/usr/local/bin大部分是/usr/local/bin)

	//express-generator
	npm install express-generator -g

	//生成项目文件
	express nodeproject

```

/bin: 用于应用启动

/public: 静态资源目录

/routes：可以认为是controller（控制器）目录

/views: jade模板目录，可以认为是view(视图)目录

app.js 程序main文件
