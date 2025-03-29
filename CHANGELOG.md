## v1.0.3 (2024-12-28)

### Fix

- add gap between buttons in import task dialog (#70)
- hide button sort if column cannot be hidden & update filterFn (#69)
- nav links added in profile dropdown (#68)

### Refactor

- optimize states in users/tasks context (#71)

## [1.8.0](https://github.com/nestorzamili/sasuai-store/compare/v1.7.0...v1.8.0) (2025-03-29)


### Features

* add core business model ([a9258cc](https://github.com/nestorzamili/sasuai-store/commit/a9258ccbfde135c4e078b2e9027ad5764c12a27c))
* **next:** add logging configuration for fetches ([ee7a45c](https://github.com/nestorzamili/sasuai-store/commit/ee7a45ca0f183db3270126033b0a8e27a2986388))

## [1.7.0](https://github.com/nestorzamili/sasuai-store/compare/v1.6.0...v1.7.0) (2025-03-28)


### Features

* **auth:** enhance session management and middleware for admin access ([1a6e62e](https://github.com/nestorzamili/sasuai-store/commit/1a6e62e32efa3f6606afbc141f0468b2f4af4865))

## [1.6.0](https://github.com/nestorzamili/sasuai-store/compare/v1.5.0...v1.6.0) (2025-03-28)


### Features

* **auth:** add admin schema and enhance user management ([284a114](https://github.com/nestorzamili/sasuai-store/commit/284a114336b335dcfb31b4ef62e446debe0c6fed))
* **auth:** implement authentication context and refactor user session handling ([991fa21](https://github.com/nestorzamili/sasuai-store/commit/991fa21bade88ebe9835ffe8f9bf7db34c7fe093))


### Bug Fixes

* **middleware:** restrict API access to email verification endpoint ([0cc89b4](https://github.com/nestorzamili/sasuai-store/commit/0cc89b41a5dbaf6f12da55744a0f3c397048ae91))


### Code Refactoring

* **auth:** remove social login options from sign-in and sign-up forms ([9d6393e](https://github.com/nestorzamili/sasuai-store/commit/9d6393e080f403e46a7fc745a4956e602a3b702c))

## [1.5.0](https://github.com/nestorzamili/sasuai-store/compare/v1.4.0...v1.5.0) (2025-03-27)


### Features

* **profile:** enhance password change form with improved validation and error handling ([50886bd](https://github.com/nestorzamili/sasuai-store/commit/50886bda17d6820d576843e649c9af518e89dbe7))
* **sign-up:** enhance form validation and error handling ([594cb04](https://github.com/nestorzamili/sasuai-store/commit/594cb048e3bd9e2d92ee8876fafdc2444998d397))

## [1.4.0](https://github.com/nestorzamili/sasuai-store/compare/v1.3.0...v1.4.0) (2025-03-26)


### Features

* **profile:** add email change functionality and update profile page ([a4f34f1](https://github.com/nestorzamili/sasuai-store/commit/a4f34f109bedde0c373739b48cf54ccf97ab1873))


### Code Refactoring

* **settings:** remove unused settings pages and components ([73e711a](https://github.com/nestorzamili/sasuai-store/commit/73e711a81f3799f9e9c921ea4c158e535029c9c9))

## [1.3.0](https://github.com/nestorzamili/sasuai-store/compare/v1.2.0...v1.3.0) (2025-03-26)


### Features

* **auth:** add reset password functionality and improve UI ([3c1c792](https://github.com/nestorzamili/sasuai-store/commit/3c1c792f5daefeb46e1a01f577af7d304a873094))
* implement help center and add new pages for products, orders, invoices, payments, shipping, and discounts ([5960498](https://github.com/nestorzamili/sasuai-store/commit/59604986aa0f44106207dbc1d13e948018e5647f))

## [1.2.0](https://github.com/nestorzamili/sasuai-store/compare/v1.1.0...v1.2.0) (2025-03-26)


### Features

* add example environment configuration file ([0063fdb](https://github.com/nestorzamili/sasuai-store/commit/0063fdb8e7536ea751bfc08aa8fc07a7a5a34398))

## [1.1.0](https://github.com/nestorzamili/sasuai-store/compare/v1.0.0...v1.1.0) (2025-03-26)


### Features

* update project branding and email functionality ([ed5ecbd](https://github.com/nestorzamili/sasuai-store/commit/ed5ecbdeef91803cbeb0492ff2393d8c062360b1))


### Chores

* update project name and license information ([440e027](https://github.com/nestorzamili/sasuai-store/commit/440e027683e2ee941649d3d3b9001033ff9c81e1))
* update project name and middleware authentication logic ([a09cb53](https://github.com/nestorzamili/sasuai-store/commit/a09cb5394154eed80328e231d20f10256d20efd0))

## 1.0.0 (2025-03-25)


### ⚠ BREAKING CHANGES

* Restructured the entire folder hierarchy to adopt a feature-based structure. This change improves code modularity and maintainability but introduces breaking changes.

### Features

* **a11y:** add "Skip to Main" button to improve keyboard navigation ([#27](https://github.com/nestorzamili/samunu-project/issues/27)) ([5768ee5](https://github.com/nestorzamili/samunu-project/commit/5768ee50185951b268475e69f3dbfaedd5c35d5f)), closes [#22](https://github.com/nestorzamili/samunu-project/issues/22)
* add 401 error page ([#12](https://github.com/nestorzamili/samunu-project/issues/12)) ([bc8ccc8](https://github.com/nestorzamili/samunu-project/commit/bc8ccc836d4fe065bf5e6c964255361afdfc4cee))
* add box sign in page ([42b6ef9](https://github.com/nestorzamili/samunu-project/commit/42b6ef9b7c48b0251e371ee018607853cfe04f33))
* add check current active nav hook ([6e5de36](https://github.com/nestorzamili/samunu-project/commit/6e5de36e40aa21814cd6f732a8bfe681c374a12e))
* add coming soon page in broken pages ([bc24520](https://github.com/nestorzamili/samunu-project/commit/bc245201356f4e126bdabd9a69325f2bd0d1e914))
* add email + password sign in page ([4871c38](https://github.com/nestorzamili/samunu-project/commit/4871c38e23cb1f19f080faeb161b5d7f20dac89e))
* add error pages ([7e173ef](https://github.com/nestorzamili/samunu-project/commit/7e173ef4fb068c0d263486ba94535c28f90f0b0c))
* add example error page for settings ([cc04c88](https://github.com/nestorzamili/samunu-project/commit/cc04c88db84e249929fd3e927c33b5b70540018b))
* add forgot-password page ([0875a98](https://github.com/nestorzamili/samunu-project/commit/0875a9871afb76bc7c2496ed99a0c23fe6a99a90))
* add loader component ui ([9f99b67](https://github.com/nestorzamili/samunu-project/commit/9f99b67cb9da2baea32c2f083619e67f20583c34))
* add main-panel in dashboard ([380e786](https://github.com/nestorzamili/samunu-project/commit/380e786e1cc750bf3ec969471e8447bb56cc2ca8))
* add multiple language support ([#37](https://github.com/nestorzamili/samunu-project/issues/37)) ([c5d163d](https://github.com/nestorzamili/samunu-project/commit/c5d163d48bf7b197c312aea4e263ff72102bb884))
* add otp page ([91b3bb1](https://github.com/nestorzamili/samunu-project/commit/91b3bb19856c077f7d800a1db17b6f635a310276))
* add password-input custom component ([4f2d632](https://github.com/nestorzamili/samunu-project/commit/4f2d63215d865f17ae0574ea83f628a110e07499))
* add remaining settings pages ([b79edc7](https://github.com/nestorzamili/samunu-project/commit/b79edc725bce38205a5e669cd5ec63fe86b61920))
* add sign-up page ([9f5f5fc](https://github.com/nestorzamili/samunu-project/commit/9f5f5fc1e6d182468335c73fdd518426779ef8e2))
* add tailwind prettier plugin ([65005a9](https://github.com/nestorzamili/samunu-project/commit/65005a93cdc150d3d799c757d7a4168c1a0deb4d))
* **auth:** enhance authentication flow with email sign-in and session management ([9bcd973](https://github.com/nestorzamili/samunu-project/commit/9bcd9736c86bab13671d1fabdb3fd5ce7fc22afb))
* **auth:** implement authentication system with better-auth and Prisma ([102b4b9](https://github.com/nestorzamili/samunu-project/commit/102b4b93a2b041092cc9d20b4f7e25776cab02e0))
* implement apps page ([b586f84](https://github.com/nestorzamili/samunu-project/commit/b586f842fea74270f92d20be0da4a704c69cd453))
* implement chat page ([#21](https://github.com/nestorzamili/samunu-project/issues/21)) ([851f730](https://github.com/nestorzamili/samunu-project/commit/851f730151099b3a3f8fa8b12d2612b95f059701))
* implement coming-soon page ([c212f61](https://github.com/nestorzamili/samunu-project/commit/c212f61a7e69e750c79c27bea6eabe8c7d371fa2))
* implement custom pin-input component ([#2](https://github.com/nestorzamili/samunu-project/issues/2)) ([fb63c4a](https://github.com/nestorzamili/samunu-project/commit/fb63c4ac731c99235287940d7903e7750b89da79))
* implement custom sidebar trigger ([7b62fb6](https://github.com/nestorzamili/samunu-project/commit/7b62fb60ba4941fda49c03be3762851246b186c3))
* implement global command/search ([f9c09b4](https://github.com/nestorzamili/samunu-project/commit/f9c09b45b727e8e88a34798db23392c23326e764))
* implement settings layout and settings profile page ([eb9adca](https://github.com/nestorzamili/samunu-project/commit/eb9adca9b15b568bb17cf0db46daed9c184fa539))
* implement task dialogs ([f452258](https://github.com/nestorzamili/samunu-project/commit/f45225822d21083937086b57411f0f977d72e1fb))
* implement tasks table and page ([cbcfd9e](https://github.com/nestorzamili/samunu-project/commit/cbcfd9ee363adde063cb6d9b745b14dddb4d5c75))
* implement user invite dialog ([9f11bcb](https://github.com/nestorzamili/samunu-project/commit/9f11bcbc0d0fe8112c1025cf792fb146abaa164e))
* implement users CRUD ([15a3a94](https://github.com/nestorzamili/samunu-project/commit/15a3a94e4858731ee35653f2189e4cf3080f5bc7)), closes [#9](https://github.com/nestorzamili/samunu-project/issues/9)
* make sidebar collapsed state in local storage ([90cd877](https://github.com/nestorzamili/samunu-project/commit/90cd877c48fbccfbbd8681c9121a30515690bc41))
* make sidebar responsive and accessible ([48208bb](https://github.com/nestorzamili/samunu-project/commit/48208bb1c0ab80740472181ee388ad709d3b0ead))
* nav links added in profile dropdown ([#68](https://github.com/nestorzamili/samunu-project/issues/68)) ([ba1a534](https://github.com/nestorzamili/samunu-project/commit/ba1a5342e5ab5bec3e695b9d3189fa5436c3e47a))
* **ui:** add dark mode ([0311558](https://github.com/nestorzamili/samunu-project/commit/031155880ef684b2f09107aa3d9a8906e75a47f7))
* **ui:** implement side nav ui ([bd88f1a](https://github.com/nestorzamili/samunu-project/commit/bd88f1a2f810f5710b2ad0d3a1d2ccd4033b2ce7))
* update dropdown nav by default if child is active ([5ee857b](https://github.com/nestorzamili/samunu-project/commit/5ee857b53e24a6eeaaedc09596d00c370b7d9368))
* update general error page to be more flexible ([4cfac3f](https://github.com/nestorzamili/samunu-project/commit/4cfac3fa5a9045ad4e660307f467bf26a05a168a))
* update theme-color meta tag when theme is updated ([72810dd](https://github.com/nestorzamili/samunu-project/commit/72810ddaf7de03f3909b502f4404846b38a118c3))
* upgrade theme button to theme dropdown ([#33](https://github.com/nestorzamili/samunu-project/issues/33)) ([bd30be4](https://github.com/nestorzamili/samunu-project/commit/bd30be4f68f614f4f5fefcae5e8bfdd54d357b4d)), closes [#29](https://github.com/nestorzamili/samunu-project/issues/29)


### Bug Fixes

* **a11y:** update default aria-label of each pin-input ([e6679cb](https://github.com/nestorzamili/samunu-project/commit/e6679cbed41b03cca5017f0d8376183fe4d56e0c))
* add gap between buttons in import task dialog ([#70](https://github.com/nestorzamili/samunu-project/issues/70)) ([c47d3df](https://github.com/nestorzamili/samunu-project/commit/c47d3df250821dba7e49006a3f465761e1e55026))
* add height and scroll area in user mutation dialogs ([a99a6b7](https://github.com/nestorzamili/samunu-project/commit/a99a6b7356b1cd12e9cbac06643d0b7acbef3025))
* add setTimeout in user dialog closing ([1663354](https://github.com/nestorzamili/samunu-project/commit/1663354202e3a6089d188d383072623a95eafd99))
* **build:** replace require with import in tailwind.config.js ([f5eeb95](https://github.com/nestorzamili/samunu-project/commit/f5eeb95774ffa3d78baeb0e8fe05d04c06f8bd02)), closes [#53](https://github.com/nestorzamili/samunu-project/issues/53)
* card layout issue in app integrations page ([7a11c51](https://github.com/nestorzamili/samunu-project/commit/7a11c51343732581e79f77456db94cf965767145))
* display menu dropdown when sidebar collapsed ([#58](https://github.com/nestorzamili/samunu-project/issues/58)) ([8d3c83b](https://github.com/nestorzamili/samunu-project/commit/8d3c83b7ac0645e61f8579154836e03c9b5ddebd))
* ensure site syncs with system theme changes ([#49](https://github.com/nestorzamili/samunu-project/issues/49)) ([9a98533](https://github.com/nestorzamili/samunu-project/commit/9a98533a694b0aac8134d0f1cb4ebc8740724b69)), closes [#48](https://github.com/nestorzamili/samunu-project/issues/48)
* exclude shadcn components from linting and remove unused props ([105d582](https://github.com/nestorzamili/samunu-project/commit/105d582ad24c0c43b35e9a21d92da05ac702470e))
* hide button sort if column cannot be hidden & update filterFn ([#69](https://github.com/nestorzamili/samunu-project/issues/69)) ([969b755](https://github.com/nestorzamili/samunu-project/commit/969b755cf8eec776c050aadf0179617d1a21945a))
* improve custom Button component ([#28](https://github.com/nestorzamili/samunu-project/issues/28)) ([9ed0da4](https://github.com/nestorzamili/samunu-project/commit/9ed0da4538d5465057bf34528c5ff3d53e26f09e))
* language dropdown issue in account setting ([6d9973c](https://github.com/nestorzamili/samunu-project/commit/6d9973cf51b8c4d638b7f142a70feed5f8c24359))
* layout shift issue in dropdown modal ([ba481db](https://github.com/nestorzamili/samunu-project/commit/ba481db69a78d39664ed4207804b97adbbadc578))
* layout wrap issue in tasks page on mobile ([8330576](https://github.com/nestorzamili/samunu-project/commit/83305768aa331fcb2c1786d649d6ab5fb7d6b461))
* loading all tabler-icon chunks in dev mode ([#59](https://github.com/nestorzamili/samunu-project/issues/59)) ([ca66e8e](https://github.com/nestorzamili/samunu-project/commit/ca66e8ede300e793b4e4bafb5c33648a8d324d14)), closes [#54](https://github.com/nestorzamili/samunu-project/issues/54)
* make sidebar scrollable when overflow ([2adb0c5](https://github.com/nestorzamili/samunu-project/commit/2adb0c5b938e5fd163923e0c30b4ec17010da6a6))
* merge two button components into one ([#60](https://github.com/nestorzamili/samunu-project/issues/60)) ([be22e75](https://github.com/nestorzamili/samunu-project/commit/be22e756623f1e5a16ed661c48ceda4a31b04a55))
* optimize onComplete/onIncomplete invocation ([#32](https://github.com/nestorzamili/samunu-project/issues/32)) ([3718cc4](https://github.com/nestorzamili/samunu-project/commit/3718cc4e2dc4bf41dccb641b193ff51fdc165370))
* prevent card stretch in filtered app layout ([758a010](https://github.com/nestorzamili/samunu-project/commit/758a01032bdf8196e6416b2d81d03fa348b427bb))
* prevent focus zoom on mobile devices ([#20](https://github.com/nestorzamili/samunu-project/issues/20)) ([a91e0aa](https://github.com/nestorzamili/samunu-project/commit/a91e0aa3cb58a6a42c122e39ed0261006fbb0153))
* recent sales responsive on ipad view ([#40](https://github.com/nestorzamili/samunu-project/issues/40)) ([ee55c19](https://github.com/nestorzamili/samunu-project/commit/ee55c19406be01dfba47c7132e18c83bf366664f))
* remove form reset logic from useEffect in task import ([e53de3a](https://github.com/nestorzamili/samunu-project/commit/e53de3ad5ea870467eb533d4af40103914c93403))
* replace nav with dropdown in mobile topnav ([6c7cdfb](https://github.com/nestorzamili/samunu-project/commit/6c7cdfb149296771d384d4c452e908f16007e823))
* resolve eslint script issue ([#18](https://github.com/nestorzamili/samunu-project/issues/18)) ([2749b79](https://github.com/nestorzamili/samunu-project/commit/2749b792ada7cc3b4fe24ec0bdf66d44a8a77efa))
* resolve OTP paste issue in multi-digit pin-input ([5933345](https://github.com/nestorzamili/samunu-project/commit/593334562ef724086c1459781dc1089a6811ca25)), closes [#16](https://github.com/nestorzamili/samunu-project/issues/16)
* restructure root layout ([108f9e2](https://github.com/nestorzamili/samunu-project/commit/108f9e2601b253b156994b1c9f3385849351ebe9))
* scrollbar dark mode style ([5000360](https://github.com/nestorzamili/samunu-project/commit/500036049478b83e6f3cd715b38921cb5d92f75e))
* solve asChild attribute issue in custom button ([#31](https://github.com/nestorzamili/samunu-project/issues/31)) ([bc75eab](https://github.com/nestorzamili/samunu-project/commit/bc75eab31676e244987f41c987ed0a5a3900d1b8))
* solve text overflow issue when nav text is long ([1143a4a](https://github.com/nestorzamili/samunu-project/commit/1143a4add31d93b8ca224be3b890473f97467eb1))
* stretch search bar only in mobile ([d19b663](https://github.com/nestorzamili/samunu-project/commit/d19b6631e7f28d1b8f49ad052c5b94f97636bc53))
* sync pin inputs programmatically ([f477f3a](https://github.com/nestorzamili/samunu-project/commit/f477f3ac05a8ebb638a21d204981a7f33402317c))
* **ui:** update label style ([8a2dc08](https://github.com/nestorzamili/samunu-project/commit/8a2dc08580992c1cf0441c5b7dfe284e0b86f22a))
* uncontrolled issue in account setting ([f59fdfc](https://github.com/nestorzamili/samunu-project/commit/f59fdfc4de05aa5be12de64bb3ad1d76cbf7db9a))
* update `/dashboard` route to just `/` ([728a025](https://github.com/nestorzamili/samunu-project/commit/728a0254924d43b3a07ff61c716e84252e3daae6))
* update border & transition of sticky columns in user table ([f9ed62d](https://github.com/nestorzamili/samunu-project/commit/f9ed62de0787549dbed4dcd79b420995683fe873))
* update error handling pages and restructure project ([45be5ee](https://github.com/nestorzamili/samunu-project/commit/45be5ee195325a005af26599ce5dcbffc820b989))
* update heading alignment to left in user dialogs ([8e2c871](https://github.com/nestorzamili/samunu-project/commit/8e2c87115e248412268d8e73d33f0701dc17bea2))
* update incorrect overflow side nav height ([2c89c15](https://github.com/nestorzamili/samunu-project/commit/2c89c158750123153ceb81b5b17c7a547bd8faca))
* update JSX types due to react 19 ([44cea34](https://github.com/nestorzamili/samunu-project/commit/44cea342a902b8ee8b86a6e74227c7c397d94955))
* update layouts and solve overflow issues ([#11](https://github.com/nestorzamili/samunu-project/issues/11)) ([6bee397](https://github.com/nestorzamili/samunu-project/commit/6bee397721e74b8c4e04fa312357302e530f3b86))
* update nav link keys ([d7c2f64](https://github.com/nestorzamili/samunu-project/commit/d7c2f64a5c7c3add271754766f1418d8ecca3aa1))
* update overall layout due to scroll-lock bug ([#66](https://github.com/nestorzamili/samunu-project/issues/66)) ([3580ea6](https://github.com/nestorzamili/samunu-project/commit/3580ea633c7e24b914fd1d9cc44596e3a052d55b)), closes [#65](https://github.com/nestorzamili/samunu-project/issues/65)
* update overflow contents with scroll area ([e2c8ce5](https://github.com/nestorzamili/samunu-project/commit/e2c8ce5a5cbf4811bb59824eb5f83eef6c16eadc))
* update spacing & alignment in dialogs/drawers ([c1b7873](https://github.com/nestorzamili/samunu-project/commit/c1b7873fa9da8f91ed27edc01b1ac90dd40a6512))
* update user column hover and selected colors ([62d538f](https://github.com/nestorzamili/samunu-project/commit/62d538f410541cd5b4631377ffc1367c5b337013))
* z-axis overflow issue in header ([ff4d667](https://github.com/nestorzamili/samunu-project/commit/ff4d667e95cf3c9058b0b55ff62560b1316143ef))


### Chores

* add CONTRIBUTING.md ([120132d](https://github.com/nestorzamili/samunu-project/commit/120132d873e1f506281e289b5bddf983a0e7cc73))
* add ISSUE_TEMPLATE ([42df9ec](https://github.com/nestorzamili/samunu-project/commit/42df9ec1854b928e38a1beeeb370c9509f794e17))
* add PULL_REQUEST_TEMPLATE.md ([dbd4e74](https://github.com/nestorzamili/samunu-project/commit/dbd4e7470611518e5284acd1fee92225f713f809))
* add release-please configuration for automated versioning and changelog generation ([0d270cd](https://github.com/nestorzamili/samunu-project/commit/0d270cd4515461935739621e910fc5fbbe728c05))
* format code with Prettier ([#19](https://github.com/nestorzamili/samunu-project/issues/19)) ([4904574](https://github.com/nestorzamili/samunu-project/commit/490457428662d5577749163b7a17ba281b894c01))
* ignore generate route in prettier and format codes ([b234f1d](https://github.com/nestorzamili/samunu-project/commit/b234f1d7c3bcab510d381ef27a9557c1ca792e8c))
* implement prettier for code formatting ([8aad05e](https://github.com/nestorzamili/samunu-project/commit/8aad05e80cd8b75d45c1f43cc642637b1b2285e6))
* implement react-router-dom for routing ([532e767](https://github.com/nestorzamili/samunu-project/commit/532e767f35c7ca10b9d7fb625ae8a081fd44888e))
* move CODE_OF_CONDUCT.md to .github ([cf65e1b](https://github.com/nestorzamili/samunu-project/commit/cf65e1bcc9b110a5947ba5f470556ab2ec3da4d3))
* **release:** 1.0.0-beta.1 ([ce1a7c2](https://github.com/nestorzamili/samunu-project/commit/ce1a7c257026869aca0ba80ac1da94f7ae430289))
* remove CHANGELOG from prettier formatting ([03546bc](https://github.com/nestorzamili/samunu-project/commit/03546bcac36d0d44a8cd2600999b0509657f9dce))
* remove outdated GitHub configuration files and user navigation component ([abe206a](https://github.com/nestorzamili/samunu-project/commit/abe206a6ca11446c831bdd82c9cce6402cd7dd8d))
* remove unnecessary date-fns dependency ([195ce94](https://github.com/nestorzamili/samunu-project/commit/195ce9445b2fb57d646a10add19a417b387abc4b))
* **ui:** add and configure shadcn ui ([914d41a](https://github.com/nestorzamili/samunu-project/commit/914d41a3b5d3929fc145d9bc63aedeed71288845))
* update copyright year in LICENSE file ([1efa743](https://github.com/nestorzamili/samunu-project/commit/1efa7436ba2399124c31f3d116f818b09bc6f7c3))
* update Next.js and axios dependencies, enable nodeMiddleware in config ([fe988d2](https://github.com/nestorzamili/samunu-project/commit/fe988d22b0b46d6e6dee25a10ba9826abc0a2370))
* update package name in release-please configuration ([71a6582](https://github.com/nestorzamili/samunu-project/commit/71a6582629280f0d6d86e042ae3e6a5f828dfe55))
* update pull request template to comment out checklist item ([dd86ab6](https://github.com/nestorzamili/samunu-project/commit/dd86ab64f9a20262e884b4e6f899407d361e02b4))
* update README to reflect project management focus and tech stack ([dafe990](https://github.com/nestorzamili/samunu-project/commit/dafe990f09980838daebc1baa70eb9b3b67eb7da))
* update site name and add meta tags ([68df7a9](https://github.com/nestorzamili/samunu-project/commit/68df7a986d3ef5f7d2173829fbbdb155308a1cca))
* upgrade ShadcnUI and update related files ([d16afd4](https://github.com/nestorzamili/samunu-project/commit/d16afd49eed41942e2a9d655c15798511e115483))
* upgrade version to 1.0.0-beta.5 ([8f5757c](https://github.com/nestorzamili/samunu-project/commit/8f5757cd68d95e27d3b12359906269f1b24b949b))
* upgrade Vite, Prettier, and ESLint ([0fc3a07](https://github.com/nestorzamili/samunu-project/commit/0fc3a07333edb05a6ba6817043679b1a4d6a67b7))


### Documentation

* update README ([239630c](https://github.com/nestorzamili/samunu-project/commit/239630c3faef31998c43c4bf288c818787caad73))
* update README and picture ([83eef76](https://github.com/nestorzamili/samunu-project/commit/83eef76f3e20a5077fccc226e9440a967272d7e9))


### Styles

* make the sidebar layout float and update spacing ([9779199](https://github.com/nestorzamili/samunu-project/commit/9779199306fcf417c3772f094cf184bb2261bff4))


### Code Refactoring

* add custom button component ([cdb3172](https://github.com/nestorzamili/samunu-project/commit/cdb3172f9a5ff9475005da70a49aed7e5c543292))
* analyze and remove unused files/exports with knip ([#67](https://github.com/nestorzamili/samunu-project/issues/67)) ([2ac0a0a](https://github.com/nestorzamili/samunu-project/commit/2ac0a0a69ecfa8a0f93ae17652f945f668073e62))
* extract redundant codes into layout component ([1bc9368](https://github.com/nestorzamili/samunu-project/commit/1bc9368eed8c1eaeb97fab071fc5f1d03bc4805c))
* move password-input component into custom component dir ([9b38001](https://github.com/nestorzamili/samunu-project/commit/9b380011d34dd83e3bdb5b14383be236b0910c16))
* optimize states in users/tasks context ([#71](https://github.com/nestorzamili/samunu-project/issues/71)) ([397f46b](https://github.com/nestorzamili/samunu-project/commit/397f46bc30cb4b98324c6e053439ea419b188950))
* remove unnecessary layout-backup file ([445f4b4](https://github.com/nestorzamili/samunu-project/commit/445f4b4ed2eb06a6490b1eb83164dd3b00ac9fcb))
* remove unused files ([559c669](https://github.com/nestorzamili/samunu-project/commit/559c669e00cd0089cd2b442645afb85af263cb03))
* reorganize project to feature-based structure ([546842f](https://github.com/nestorzamili/samunu-project/commit/546842f14f032ef3ded908180ed317bfdec46496))
* **ui:** remove unnecessary spacing ([c32385f](https://github.com/nestorzamili/samunu-project/commit/c32385f0ca56f436940c11057d892dccea393a2b))
* update layouts and extract common layout ([8936dbe](https://github.com/nestorzamili/samunu-project/commit/8936dbede61eb1fafb34db6273308d6f97f13e81))
* update main panel layout ([e4af42a](https://github.com/nestorzamili/samunu-project/commit/e4af42a1fecf40ee46071acf00941f7cfb6c1c06))
* update main panel to be responsive ([573f10f](https://github.com/nestorzamili/samunu-project/commit/573f10f1b9b7f79d807d19890ccf47bd235dbe32))
* update major layouts and styling ([4fd9ad2](https://github.com/nestorzamili/samunu-project/commit/4fd9ad288edb18d58b3b36aad9b65dcab36be52f))
* update react-router to use new api for routing ([14cdd41](https://github.com/nestorzamili/samunu-project/commit/14cdd412910ac2d4ec0871f45c339d91d03ee38f))
* update sidebar collapsed state to false in mobile ([e7efdc1](https://github.com/nestorzamili/samunu-project/commit/e7efdc19d231bd638702140e51087ef4e08626dd))
* update sidebar logo and title ([6df1572](https://github.com/nestorzamili/samunu-project/commit/6df1572420ed7b6972415fba2294ce893c465be4))

## v1.0.2 (2024-12-25)

### Fix

- update overall layout due to scroll-lock bug (#66)

### Refactor

- analyze and remove unused files/exports with knip (#67)

## v1.0.1 (2024-12-14)

### Fix

- merge two button components into one (#60)
- loading all tabler-icon chunks in dev mode (#59)
- display menu dropdown when sidebar collapsed (#58)
- update spacing & alignment in dialogs/drawers
- update border & transition of sticky columns in user table
- update heading alignment to left in user dialogs
- add height and scroll area in user mutation dialogs
- update `/dashboard` route to just `/`
- **build**: replace require with import in tailwind.config.js

### Refactor

- remove unnecessary layout-backup file

## v1.0.0 (2024-12-09)

### BREAKING CHANGE

- Restructured the entire folder
hierarchy to adopt a feature-based structure. This
change improves code modularity and maintainability
but introduces breaking changes.

### Feat

- implement task dialogs
- implement user invite dialog
- implement users CRUD
- implement global command/search
- implement custom sidebar trigger
- implement coming-soon page

### Fix

- uncontrolled issue in account setting
- card layout issue in app integrations page
- remove form reset logic from useEffect in task import
- update JSX types due to react 19
- prevent card stretch in filtered app layout
- layout wrap issue in tasks page on mobile
- update user column hover and selected colors
- add setTimeout in user dialog closing
- layout shift issue in dropdown modal
- z-axis overflow issue in header
- stretch search bar only in mobile
- language dropdown issue in account setting
- update overflow contents with scroll area

### Refactor

- update layouts and extract common layout
- reorganize project to feature-based structure

## v1.0.0-beta.5 (2024-11-11)

### Feat

- add multiple language support (#37)

### Fix

- ensure site syncs with system theme changes (#49)
- recent sales responsive on ipad view (#40)

## v1.0.0-beta.4 (2024-09-22)

### Feat

- upgrade theme button to theme dropdown (#33)
- **a11y**: add "Skip to Main" button to improve keyboard navigation (#27)

### Fix

- optimize onComplete/onIncomplete invocation (#32)
- solve asChild attribute issue in custom button (#31)
- improve custom Button component (#28)

## v1.0.0-beta.3 (2024-08-25)

### Feat

- implement chat page (#21)
- add 401 error page (#12)
- implement apps page
- add otp page

### Fix

- prevent focus zoom on mobile devices (#20)
- resolve eslint script issue (#18)
- **a11y**: update default aria-label of each pin-input
- resolve OTP paste issue in multi-digit pin-input
- update layouts and solve overflow issues (#11)
- sync pin inputs programmatically

## v1.0.0-beta.2 (2024-03-18)

### Feat

- implement custom pin-input component (#2)

## v1.0.0-beta.1 (2024-02-08)

### Feat

- update theme-color meta tag when theme is updated
- add coming soon page in broken pages
- implement tasks table and page
- add remaining settings pages
- add example error page for settings
- update general error page to be more flexible
- implement settings layout and settings profile page
- add error pages
- add password-input custom component
- add sign-up page
- add forgot-password page
- add box sign in page
- add email + password sign in page
- make sidebar responsive and accessible
- add tailwind prettier plugin
- make sidebar collapsed state in local storage
- add check current active nav hook
- add loader component ui
- update dropdown nav by default if child is active
- add main-panel in dashboard
- **ui**: add dark mode
- **ui**: implement side nav ui

### Fix

- update incorrect overflow side nav height
- exclude shadcn components from linting and remove unused props
- solve text overflow issue when nav text is long
- replace nav with dropdown in mobile topnav
- make sidebar scrollable when overflow
- update nav link keys
- **ui**: update label style

### Refactor

- move password-input component into custom component dir
- add custom button component
- extract redundant codes into layout component
- update react-router to use new api for routing
- update main panel layout
- update major layouts and styling
- update main panel to be responsive
- update sidebar collapsed state to false in mobile
- update sidebar logo and title
- **ui**: remove unnecessary spacing
- remove unused files
