import { defineNuxtPlugin } from '#app'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Solid icons
import {
  faBolt,
  faUser,
  faMoon,
  faSun,
  faPen,
  faFolder,
  faLink,
  faFloppyDisk,
  faXmark,
  faPlus,
  faCheck,
  faImage,
  faChartBar,
  faGear,
  faRocket,
  faFire,
  faWandMagicSparkles,
  faTrashCan,
  faArrowUpRightFromSquare,
  faCode,
  faEye,
  faDownload,
  faUpload,
  faMagnifyingGlass,
  faFilter,
  faSort,
  faAngleDown,
  faAngleUp,
  faAngleLeft,
  faAngleRight,
  faBars,
  faHouse,
  faFileLines,
  faTags,
  faCircleCheck,
  faCircle,
  faPencil,
  faPalette,
  faBox,
  faRobot,
  faLockOpen,
  faPenToSquare,
  faBullseye,
  faComputer,
  faFolderOpen
} from '@fortawesome/free-solid-svg-icons'

// Brand icons
import {
  faGithub,
  faGitAlt,
  faGitee
} from '@fortawesome/free-brands-svg-icons'

// Regular icons
import {
  faCircle as faCircleRegular
} from '@fortawesome/free-regular-svg-icons'

// Library configuration
import { library } from '@fortawesome/fontawesome-svg-core'

// Add icons to library
library.add(
  // Solid
  faBolt, faUser, faMoon, faSun, faPen, faFolder, faLink,
  faFloppyDisk, faXmark, faPlus, faCheck, faImage, faChartBar,
  faGear, faRocket, faFire, faWandMagicSparkles, faTrashCan,
  faArrowUpRightFromSquare, faCode, faEye, faDownload, faUpload,
  faMagnifyingGlass, faFilter, faSort, faAngleDown, faAngleUp,
  faAngleLeft, faAngleRight, faBars, faHouse, faFileLines, faTags,
  faCircleCheck, faCircle, faPencil, faPalette, faBox, faRobot, faLockOpen, faPenToSquare, faBullseye, faComputer,faFolderOpen,
  // Brands
  faGithub, faGitAlt, faGitee,
  // Regular
  faCircleRegular
)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon)
  // Also register as FaIcon for convenience
  nuxtApp.vueApp.component('FaIcon', FontAwesomeIcon)
})
