<?php

class TM_GaPluginEvents_Helper_Data extends Mage_Core_Helper_Abstract
{

    public function getControllerName()
    {
        $controller = array();
        $controller[] = $this->_getRequest()->getRouteName();
        $controller[] = $this->_getRequest()->getControllerName();
        $controller[] = $this->_getRequest()->getActionName();
        // remove index action or controller
        while (count($controller) > 1) {
            $i = count($controller) - 1;
            if ($controller[$i] != 'index') {
                break;
            }
            array_pop($controller);
        }
        // workaround to determinate highlight type
        if (strtolower($controller[0]) == 'highlight') {
            $controller[] = $this->_getRequest()->getParam('type');
        } elseif (strtolower($controller[0]) == 'cms') {
            $pageId = $this->_getRequest()->getParam('page_id');
            $urlKey = trim($this->_getRequest()->getPathInfo(), '/');
            $controller[] = $urlKey ? $urlKey : 'home';
        }

        return implode(array_map('ucfirst', $controller));
    }

}
