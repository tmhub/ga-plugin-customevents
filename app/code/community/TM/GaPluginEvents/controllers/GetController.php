<?php

class TM_GaPluginEvents_GetController extends Mage_Core_Controller_Front_Action
{

    public function preDispatch()
    {
        parent::preDispatch();
        if (!$this->getRequest()->isXmlHttpRequest()) {
            $this->setFlag('', 'no-dispatch', true);
            $this->_redirect('noRoute');
        }
    }

    public function cartAction()
    {
        $this->sendJson(array(
            'count' => Mage::helper('checkout/cart')->getSummaryCount(),
            'total' => Mage::helper('checkout/cart')->getQuote()->getSubtotal()
        ));
    }

    public function sendJson($response)
    {
        $this->getResponse()->clearHeaders()->setHeader('Content-type','application/json',true);
        $this->getResponse()->setBody(json_encode($response));
    }

}
